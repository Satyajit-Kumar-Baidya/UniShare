import { motion } from 'motion/react';
import { Search, MessageSquare, CreditCard, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Discover",
      description: "Search for textbooks, stationary, or subscription groups. Filter by your university or browse globally."
    },
    {
      icon: MessageSquare,
      title: "2. Connect",
      description: "Message the seller or group owner securely through our platform to ask questions or arrange a meetup."
    },
    {
      icon: CreditCard,
      title: "3. Transact",
      description: "Pay securely online or agree to pay in person. For subscriptions, payments are handled automatically."
    },
    {
      icon: CheckCircle,
      title: "4. Succeed",
      description: "Get the resources you need for your studies while saving money and reducing environmental waste."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto space-y-16 py-8 font-body"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight font-display">How It Works</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
          Four simple steps to get the study materials you need, or share the costs of the services you love.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Decorative connecting line for desktop */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 transform -translate-y-1/2" />
        
        {steps.map((step, index) => (
          <motion.div 
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-white">
              <step.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 font-display">{step.title}</h3>
            <p className="text-gray-500 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
