import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
