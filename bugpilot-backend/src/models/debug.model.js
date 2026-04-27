import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    rootCause: {
      type: String,
      default: "",
    },
    explanation: {
      type: String,
      default: "",
    },
    solution: {
      type: String,
      default: "",
    },
    codeSnippet: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    tags: [
      {
        type: String,
      },
    ],
    references: [
      {
        type: String,
      },
    ],
  },
  { _id: false }
);

const debugSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    inputType: {
      type: String,
      enum: ["text", "code", "image", "log"],
      required: true,
    },

    textInput: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      enum: [
        "javascript",
        "typescript",
        "python",
        "java",
        "c",
        "cpp",
        "csharp",
        "go",
        "rust",
        "ruby",
        "php",
        "swift",
        "kotlin",
        "bash",
        "sql",
        "html",
        "css",
        "json",
        "yaml",
        "other",
        "unknown",
      ],
      default: "unknown",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    analysis: {
      type: analysisSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    tokensUsed: {
      type: Number,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

debugSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Debug", debugSchema);