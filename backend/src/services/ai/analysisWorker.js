"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Analysis, File } = require("../../models");
const analysisService = require("../analysisService");
const aiAgentAdapter = require("./aiAdapter");

const POLL_INTERVAL_MS = 5000;
let isPolling = false;
let intervalId = null;

/**
 * Background worker to orchestrate Analysis queue processing.
 */
class AnalysisWorker {
  /**
   * Start the polling loop.
   */
  start() {
    if (intervalId) {
      console.log("[AnalysisWorker] Worker is already running.");
      return;
    }

    console.log("[AnalysisWorker] Starting analysis polling worker...");
    intervalId = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  /**
   * Stop the polling loop.
   */
  stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log("[AnalysisWorker] Polling worker stopped.");
    }
  }

  /**
   * Poll for a single QUEUED analysis.
   */
  async poll() {
    if (isPolling) return; // Prevent concurrent polling cycles
    isPolling = true;

    try {
      // Atomically find one QUEUED analysis and update its status to PROCESSING.
      // This is highly robust and avoids multiple concurrent workers picking up the same job.
      const analysis = await Analysis.findOneAndUpdate(
        { status: "QUEUED" },
        { 
          $set: { 
            status: "PROCESSING", 
            startedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      if (analysis) {
        console.log(`[AnalysisWorker] Picked up Analysis ${analysis._id} for processing.`);
        await this.process(analysis);
      }
    } catch (err) {
      console.error("[AnalysisWorker] Polling error:", err.message);
    } finally {
      isPolling = false;
    }
  }

  /**
   * Process a single analysis.
   * 
   * @param {Object} analysis - The Analysis document
   */
  async process(analysis) {
    const analysisId = analysis._id.toString();

    try {
      // 1. Verify analysis exists and has correct status (it was just set to PROCESSING)
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      // 2. Validate inputFiles array
      if (!analysis.inputFiles || analysis.inputFiles.length === 0) {
        throw new Error("missing inputFiles");
      }

      const resolvedFiles = [];

      // 3. Resolve each File ID
      for (const fileId of analysis.inputFiles) {
        // Validate ObjectID pattern
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
          throw new Error("invalid File ID");
        }

        // Fetch File record
        const file = await File.findById(fileId);
        if (!file) {
          throw new Error("File not found");
        }

        // Check if file is deleted
        if (file.status === "DELETED") {
          throw new Error("File not found"); // Map deleted to not found for worker boundary
        }

        // Check if storageKey exists
        if (!file.storageKey) {
          throw new Error("missing storageKey");
        }

const backendRoot = path.resolve(__dirname, "../../..");
      const physicalPath = path.resolve(backendRoot, file.storageKey);

        // Check physical file availability
        if (!fs.existsSync(physicalPath)) {
          throw new Error("physical file unavailable");
        }

        resolvedFiles.push({
          fileId: file._id.toString(),
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          storageKey: file.storageKey,
          status: file.status,
          classification: file.classification,
          physicalPath: physicalPath
        });
      }

      // 4. Prepare payload for AI/Agent adapter
      const payload = {
        analysisId: analysisId,
        type: analysis.type,
        instruction: analysis.instruction,
        inputFiles: resolvedFiles
      };

      // 5. Pass payload to the adapter and await result
      let aiResult;
      try {
        aiResult = await aiAgentAdapter.processAnalysis(payload);
      } catch (err) {
        throw new Error(`AI/Agent failure: ${err.message}`);
      }

      if (!aiResult || !aiResult.success) {
        throw new Error("AI/Agent failure");
      }

      // 6. On success: Update analysis to COMPLETED using existing update service logic
      try {
        await analysisService.updateAnalysisStatus(analysisId, "COMPLETED", {
          result: aiResult.result,
          agentPlan: aiResult.agentPlan
        });
        console.log(`[AnalysisWorker] Analysis ${analysisId} processed successfully.`);
      } catch (err) {
        throw new Error(`status update failure: ${err.message}`);
      }

    } catch (err) {
      console.error(`[AnalysisWorker] Failed to process Analysis ${analysisId}:`, err.message);
      
      // Update analysis to FAILED with meaningful error message using existing update service logic
      try {
        await analysisService.updateAnalysisStatus(analysisId, "FAILED", {
          error: { message: err.message }
        });
      } catch (statusErr) {
        console.error(`[AnalysisWorker] Status update failure for failed Analysis ${analysisId}:`, statusErr.message);
      }
    }
  }
}

module.exports = new AnalysisWorker();
