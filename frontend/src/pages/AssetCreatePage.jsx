import { motion } from "framer-motion";
import { ArrowLeft, Brain, Lightbulb, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SmartAssetForm } from "../components/assets/SmartAssetForm";
import { assetService } from "../services/assetService";

export const AssetCreatePage = () => {
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);

  const handleSubmit = async (data) => {
    await assetService.create(data);
    navigate("/app/assets");
  };

  const handleCancel = () => {
    navigate("/app/assets");
  };

  const tips = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI-Powered Detection",
      description:
        "Just start typing! Our AI will automatically detect brands, categories, and suggest details.",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Smart Auto-Fill",
      description:
        "High-confidence suggestions are applied automatically to save you time.",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Multi-Industry Support",
      description:
        "From computers to vehicles, medical devices to machinery - we've got you covered.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/app/assets")}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Assets
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-1">
                Add New Asset
              </h1>
              <p className="text-lg text-slate-600 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                AI-powered asset creation with smart suggestions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-bold text-indigo-900">
                  Quick Tips
                </h3>
              </div>
              <button
                onClick={() => setShowTips(false)}
                className="text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    {tip.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {tip.title}
                    </h4>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <SmartAssetForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-3 justify-center"
        >
          {[
            "🤖 AI-Powered",
            "⚡ Real-time Detection",
            "🎯 Smart Suggestions",
            "🌍 Multi-Industry",
            "📱 Mobile Ready",
          ].map((badge, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
