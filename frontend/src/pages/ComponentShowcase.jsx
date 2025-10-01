import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  Download,
  Heart,
  Star,
  Mail,
  Sparkles
} from 'lucide-react';
try {
  var { 
    Button, 
    Card, 
    Input, 
    Modal, 
    ConfirmModal,
    Badge, 
    StatusBadge, 
    NotificationBadge,
    Avatar,
    AvatarGroup,
    Progress,
    CircularProgress,
    Skeleton
  } = require('../components/ui');
} catch (error) {
  console.error('Error importing UI components:', error);
  // Fallback empty components to prevent crashes
  var Button = () => React.createElement('button', null, 'Button');
  var Card = ({ children }) => React.createElement('div', null, children);
  Card.Header = ({ children }) => React.createElement('div', null, children);
  Card.Content = ({ children }) => React.createElement('div', null, children);
  var Input = () => React.createElement('input', null);
  var Modal = () => null;
  var ConfirmModal = () => null;
  var Badge = ({ children }) => React.createElement('span', null, children);
  var StatusBadge = ({ status }) => React.createElement('span', null, status);
  var NotificationBadge = ({ count }) => React.createElement('span', null, count);
  var Avatar = () => React.createElement('div', null, 'Avatar');
  var AvatarGroup = () => React.createElement('div', null, 'AvatarGroup');
  var Progress = () => React.createElement('div', null, 'Progress');
  var CircularProgress = () => React.createElement('div', null, 'CircularProgress');
  var Skeleton = () => React.createElement('div', null, 'Skeleton');
}

/**
 * Component Showcase - Demonstrating $1M Apple-Grade Quality
 * This page showcases all our premium components with real interactions
 */

const ComponentShowcase = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState(35);
  const [isLoading, setIsLoading] = useState(false);

  // Animate progress for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const avatarData = [
    { id: 1, name: 'John Doe', src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: 2, name: 'Jane Smith', initials: 'JS' },
    { id: 3, name: 'Mike Johnson', initials: 'MJ' },
    { id: 4, name: 'Sarah Wilson', initials: 'SW' },
    { id: 5, name: 'David Brown', initials: 'DB' },
    { id: 6, name: 'Emma Davis', initials: 'ED' },
    { id: 7, name: 'James Wilson', initials: 'JW' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 p-4 sm:p-6 lg:p-8 safe-area-top safe-area-bottom">
      <motion.div
        className="max-w-6xl mx-auto space-y-8 sm:space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center px-4">
          <h1 className="text-display-lg font-bold text-apple-text-primary mb-4">
            Premium Component Library
          </h1>
          <p className="text-body-lg text-apple-text-secondary max-w-2xl mx-auto">
            Experience our $1M Apple-grade UI components with buttery-smooth animations, 
            perfect interactions, and invisible design details that feel magical.
          </p>
        </motion.div>

        {/* Buttons Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Buttons</h2>
              <p className="text-apple-text-secondary">Premium buttons with micro-interactions</p>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <h3 className="text-body-md font-medium text-apple-text-secondary">Primary</h3>
                  <div className="space-y-2">
                    <Button size="sm" icon={Plus} className="w-full sm:w-auto">Small</Button>
                    <Button icon={Download} className="w-full sm:w-auto">Medium</Button>
                    <Button size="lg" icon={Heart} className="w-full sm:w-auto">Large</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-body-md font-medium text-apple-text-secondary">Variants</h3>
                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full sm:w-auto">Secondary</Button>
                    <Button variant="glass" icon={Sparkles} className="w-full sm:w-auto">Glass</Button>
                    <Button variant="outline" className="w-full sm:w-auto">Outline</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-body-md font-medium text-apple-text-secondary">Interactive</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" icon={Settings} className="w-full sm:w-auto">Ghost</Button>
                    <Button variant="danger" icon={Bell} className="w-full sm:w-auto">Danger</Button>
                    <Button loading={isLoading} onClick={handleLoadingDemo} className="w-full sm:w-auto">
                      {isLoading ? 'Loading...' : 'Try Loading'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-body-md font-medium text-apple-text-secondary">States</h3>
                  <div className="space-y-2">
                    <Button loading className="w-full sm:w-auto">Loading</Button>
                    <Button disabled className="w-full sm:w-auto">Disabled</Button>
                    <Button size="xs" icon={Star} className="w-full sm:w-auto">Extra Small</Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-apple-glass-light rounded-radius-md">
                <p className="text-body-sm text-apple-text-secondary">
                  💫 <strong>Click any button to see the ripple effect!</strong> Each button has micro-interactions 
                  with Framer Motion animations, hover glows, and tactile feedback.
                </p>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Input Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Form Inputs</h2>
              <p className="text-apple-text-secondary">Beautiful forms with floating labels and validation</p>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    variant="floating"
                    success={email.includes('@') && email.includes('.') ? "Valid email format" : null}
                  />
                  <Input
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="floating"
                    required
                  />
                  <Input
                    type="text"
                    label="Search"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="space-y-4">
                  <Input
                    label="Standard Input"
                    placeholder="Enter text..."
                  />
                  <Input
                    label="Error State"
                    error="This field is required"
                    placeholder="Invalid input"
                  />
                  <Input
                    label="Disabled Input"
                    placeholder="Cannot edit"
                    disabled
                    value="Readonly value"
                  />
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Badges Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Badges & Status</h2>
              <p className="text-apple-text-secondary">Status indicators and notification badges</p>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" icon={Star}>Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="glass">Glass</Badge>
                  <Badge variant="outline" removable>Removable</Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <StatusBadge status="online" />
                  <StatusBadge status="away" />
                  <StatusBadge status="busy" />
                  <StatusBadge status="offline" />
                  
                  <div className="relative">
                    <Bell className="w-6 h-6 text-apple-text-secondary" />
                    <NotificationBadge count={3} className="absolute -top-1 -right-1" />
                  </div>
                  
                  <div className="relative">
                    <Mail className="w-6 h-6 text-apple-text-secondary" />
                    <NotificationBadge count={127} className="absolute -top-1 -right-1" />
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Avatar Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Avatars</h2>
              <p className="text-apple-text-secondary">User avatars with status and grouping</p>
            </Card.Header>
            <Card.Content>
              <div className="space-y-8">
                {/* Individual Avatars */}
                <div>
                  <h3 className="text-body-md font-medium text-apple-text-secondary mb-4">Individual Avatars</h3>
                  <div className="flex items-center gap-4">
                    <Avatar size="xs" name="John Doe" />
                    <Avatar size="sm" name="Jane Smith" status="online" showStatus />
                    <Avatar size="md" name="Mike Johnson" ring />
                    <Avatar size="lg" name="Sarah Wilson" variant="glass" />
                    <Avatar size="xl" name="David Brown" variant="gradient" />
                    <Avatar 
                      size="2xl" 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b829?w=150&h=150&fit=crop&crop=face" 
                      name="Emma Davis"
                      status="away"
                      showStatus
                      ring="success"
                    />
                  </div>
                </div>

                {/* Avatar Groups */}
                <div>
                  <h3 className="text-body-md font-medium text-apple-text-secondary mb-4">Avatar Groups</h3>
                  <div className="space-y-4">
                    <AvatarGroup avatars={avatarData.slice(0, 4)} size="md" />
                    <AvatarGroup avatars={avatarData} max={5} size="lg" />
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Progress Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Progress & Loading</h2>
              <p className="text-apple-text-secondary">Premium progress bars and loading states</p>
            </Card.Header>
            <Card.Content>
              <div className="space-y-8">
                {/* Linear Progress */}
                <div>
                  <h3 className="text-body-md font-medium text-apple-text-secondary mb-4">Linear Progress</h3>
                  <div className="space-y-6">
                    <Progress value={progress} showLabel label="Animated Progress" />
                    <Progress value={75} variant="glass" showLabel label="Glass Variant" />
                    <Progress value={60} size="lg" showLabel label="Large Size" />
                    <Progress indeterminate label="Loading..." />
                  </div>
                </div>

                {/* Circular Progress */}
                <div>
                  <h3 className="text-body-md font-medium text-apple-text-secondary mb-4">Circular Progress</h3>
                  <div className="flex items-center gap-6">
                    <CircularProgress value={progress} showLabel size="lg" />
                    <CircularProgress value={85} variant="success" showLabel />
                    <CircularProgress value={45} variant="warning" showLabel />
                    <CircularProgress indeterminate variant="default" />
                  </div>
                </div>

                {/* Skeleton Loaders */}
                <div>
                  <h3 className="text-body-md font-medium text-apple-text-secondary mb-4">Skeleton Loaders</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton variant="circle" width={48} height={48} />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                    <Skeleton variant="rectangle" width="100%" height={200} className="rounded-radius-md" />
                    <div className="flex gap-2">
                      <Skeleton variant="button" width={100} />
                      <Skeleton variant="button" width={80} />
                    </div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Modal Section */}
        <motion.section variants={itemVariants}>
          <Card>
            <Card.Header>
              <h2 className="text-heading-2 font-semibold">Modals</h2>
              <p className="text-apple-text-secondary">Premium modals with glass morphism and animations</p>
            </Card.Header>
            <Card.Content>
              <div className="flex gap-4">
                <Button onClick={() => setShowModal(true)}>
                  Open Modal
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => setShowConfirmModal(true)}
                >
                  Confirm Action
                </Button>
              </div>
            </Card.Content>
          </Card>
        </motion.section>

        {/* Modals */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Premium Modal"
          variant="glass"
        >
          <div className="space-y-4">
            <p className="text-apple-text-secondary">
              This is a premium modal with glass morphism effects, perfect animations,
              and accessibility features built-in.
            </p>
            <Input
              label="Your Name"
              placeholder="Enter your name..."
              variant="floating"
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowModal(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => console.log('Confirmed!')}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Keep"
          variant="danger"
        />
      </motion.div>
    </div>
  );
};

export default ComponentShowcase;
