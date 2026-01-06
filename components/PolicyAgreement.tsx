
import React from 'react';

interface PolicyAgreementProps {
  onAgree: () => void;
  onDisagree: () => void;
}

const PolicyAgreement: React.FC<PolicyAgreementProps> = ({ onAgree, onDisagree }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="max-w-xl w-full glass rounded-[30px] shadow-2xl overflow-hidden border border-white/40 dark:border-white/10">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Terms and Conditions</h2>
          <div className="h-64 overflow-y-auto mb-8 pr-2 text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed custom-scrollbar">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Last updated: October 2023</p>
            <p>Welcome to Smart Energia. By using this application, you agree to our processing of your energy consumption data to provide insights and visualizations.</p>
            <p>1. <span className="font-semibold text-gray-800 dark:text-gray-100">Data Collection:</span> We collect energy usage metrics from your smart meters to calculate costs and provide efficiency recommendations.</p>
            <p>2. <span className="font-semibold text-gray-800 dark:text-gray-100">Privacy:</span> Your data is encrypted and stored securely. We do not sell your personal data to third parties.</p>
            <p>3. <span className="font-semibold text-gray-800 dark:text-gray-100">AI Insights:</span> This app uses advanced language models to provide suggestions. These are recommendations only and should be verified with a certified energy auditor.</p>
            <p>4. <span className="font-semibold text-gray-800 dark:text-gray-100">Account Security:</span> You are responsible for maintaining the confidentiality of your login credentials.</p>
            <p>By clicking "Agree", you accept these terms in their entirety. If you do not agree, you will not be able to access the dashboard features.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onAgree}
              className="flex-1 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Agree and Continue
            </button>
            <button
              onClick={onDisagree}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
            >
              Don't Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAgreement;
