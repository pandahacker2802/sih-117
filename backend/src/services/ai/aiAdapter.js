"use strict";

const { spawn } = require("child_process");
const path = require("path");

const PYTHON_PATH =
  process.env.RAG_PYTHON_PATH ||
  "python";

const RAG_BRIDGE =
  process.env.RAG_BRIDGE_PATH ||
  path.resolve(__dirname, "../../../../RAG/rag_bridge.py");

class AIAgentAdapter {
  async processAnalysis(payload) {
    console.log(`[AIAgentAdapter] Processing Analysis: ${payload.analysisId}`);
    console.log(`[AIAgentAdapter] Instruction: "${payload.instruction}"`);

    const files = (payload.inputFiles || []).map((file) => file.physicalPath);

    console.log("[AIAgentAdapter] Files sent to RAG:", files);

    return new Promise((resolve, reject) => {
      const python = spawn(
        PYTHON_PATH,
        [RAG_BRIDGE],
        {
          env: {
            ...process.env,
            PYTHONUNBUFFERED: "1"
          }
        }
      );

      let output = "";
      let errorOutput = "";

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      python.on("error", (error) => {
        reject(
          new Error(`Failed to start RAG process: ${error.message}`)
        );
      });

      python.on("close", (code) => {
        if (code !== 0) {
          return reject(
            new Error(
              errorOutput || `RAG process exited with code ${code}`
            )
          );
        }

        try {
          const response = JSON.parse(output);

          if (!response.success) {
            return reject(
              new Error(response.error || "RAG failed")
            );
          }

          resolve({
            success: true,
            result: response.result,
            agentPlan: {
              stepsRun: [
                "backend_analysis_worker",
                "uploaded_file_resolution",
                "rag_bridge",
                "document_ingestion",
                "chromadb_retrieval",
                "gemma_generation"
              ]
            }
          });
        } catch (error) {
          reject(
            new Error(`Invalid RAG response: ${error.message}`)
          );
        }
      });

      const request = JSON.stringify({
        question: payload.instruction || "",
        files
      });

      python.stdin.write(request);
      python.stdin.end();
    });
  }
}

module.exports = new AIAgentAdapter();