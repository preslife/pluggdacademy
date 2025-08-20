import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { 
  Brain, 
  Sparkles, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Clock,
  Star,
  Zap,
  Search,
  Filter,
  RefreshCw,
  Lightbulb,
  Rocket,
  Award,
  Globe,
  Heart,
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserPreferences {
  interests: string[];
  careerGoals: string[];
  learningStyle: string;
  timeCommitment: string;
  currentSkillLevel: string;
  preferredFormat: string[];
}

export function RecommendationEngine() {
  // Clean state - no mock data
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [personalizedCourses, setPersonalizedCourses] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  // User preferences - starts empty
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    careerGoals: [],
    learningStyle: '',
    timeCommitment: '',
    currentSkillLevel: '',
    preferredFormat: []
  });

  // Preference options
  const interestOptions = [
    'Programming', 'Data Science', 'Web Development', 'Mobile Development',
    'AI/Machine Learning', 'Cybersecurity', 'Cloud Computing', 'DevOps',
    'Digital Marketing', 'Business Strategy', 'Design', 'Finance',
    'Project Management', 'Leadership', 'Communication', 'Personal Development'
  ];

  const careerGoalOptions = [
    'Switch Careers', 'Get Promoted', 'Start a Business', 'Freelancing',
    'Skill Enhancement', 'Academic Achievement', 'Personal Interest',
    'Professional Certification', 'Industry Transition', 'Leadership Role'
  ];

  const learningStyleOptions = [
    { id: 'visual', name: 'Visual (videos, diagrams, infographics)' },
    { id: 'auditory', name: 'Auditory (lectures, discussions, podcasts)' },
    { id: 'hands-on', name: 'Hands-on (projects, practice, labs)' },
    { id: 'reading', name: 'Reading/Writing (articles, notes, exercises)' }
  ];

  const timeCommitmentOptions = [
    { id: '1-2', name: '1-2 hours per week' },
    { id: '3-5', name: '3-5 hours per week' },
    { id: '6-10', name: '6-10 hours per week' },
    { id: '10+', name: '10+ hours per week' }
  ];

  const skillLevelOptions = [
    { id: 'beginner', name: 'Beginner - New to the field' },
    { id: 'intermediate', name: 'Intermediate - Some experience' },
    { id: 'advanced', name: 'Advanced - Experienced professional' }
  ];

  const formatOptions = [
    'Video Courses', 'Interactive Tutorials', 'Live Classes', 'Reading Materials',
    'Hands-on Projects', 'Assessments & Quizzes', 'Community Discussions', 'Mentorship'
  ];

  // Empty state components
  const PreferenceSetup = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Get Personalized Recommendations</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Tell us about your learning goals and preferences to receive AI-powered 
              course recommendations tailored just for you.
            </p>
          </div>

          <Tabs defaultValue="interests" className="max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="interests">Interests</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
            </TabsList>

            <TabsContent value="interests" className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold mb-3">What subjects interest you?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox 
                        id={interest}
                        checked={preferences.interests.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              interests: [...prev.interests, interest]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              interests: prev.interests.filter(i => i !== interest)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={interest} className="text-sm">{interest}</label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold mb-3">What are your career goals?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                <div className="grid grid-cols-2 gap-3">
                  {careerGoalOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox 
                        id={goal}
                        checked={preferences.careerGoals.includes(goal)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              careerGoals: [...prev.careerGoals, goal]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              careerGoals: prev.careerGoals.filter(g => g !== goal)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={goal} className="text-sm">{goal}</label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">How do you prefer to learn?</h3>
                  <Select 
                    value={preferences.learningStyle} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, learningStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningStyleOptions.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">How much time can you dedicate?</h3>
                  <Select 
                    value={preferences.timeCommitment} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, timeCommitment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time commitment" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeCommitmentOptions.map(time => (
                        <SelectItem key={time.id} value={time.id}>
                          {time.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">What's your current skill level?</h3>
                  <Select 
                    value={preferences.currentSkillLevel} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, currentSkillLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevelOptions.map(level => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-6 mt-6">
              <div>
                <h3 className="font-semibold mb-3">Preferred learning formats?</h3>
                <p className="text-sm text-muted-foreground mb-4">Select all that you enjoy</p>
                <div className="grid grid-cols-2 gap-3">
                  {formatOptions.map(format => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox 
                        id={format}
                        checked={preferences.preferredFormat.includes(format)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              preferredFormat: [...prev.preferredFormat, format]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              preferredFormat: prev.preferredFormat.filter(f => f !== format)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={format} className="text-sm">{format}</label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-8">
            <Button 
              onClick={generateRecommendations}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
              disabled={preferences.interests.length === 0 || !preferences.learningStyle}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate My Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation process
    setTimeout(() => {
      setHasPreferences(true);
      setIsGenerating(false);
      // In real app, this would make API calls to generate recommendations
    }, 3000);
  };

  const EmptyRecommendationsState = () => (
    <div className="text-center py-16">
      <Brain className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">No Recommendations Yet</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Complete your learning preferences to receive personalized course recommendations 
        powered by AI.
      </p>
      <Button 
        onClick={() => setHasPreferences(false)}
        className="bg-gradient-to-r from-blue-500 to-purple-500"
      >
        <Settings className="h-4 w-4 mr-2" />
        Set Up Preferences
      </Button>
    </div>
  );

  // Show loading state when generating
  if (isGenerating) {
    return (
      <div className="p-6 space-y-6 min-h-full bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Brain className="h-16 w-16 text-blue-500" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-6 mb-4">AI is Analyzing Your Preferences</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our recommendation engine is finding the perfect courses for your learning journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalized learning paths powered by artificial intelligence
          </p>
        </div>

        {hasPreferences && (
          <Button 
            onClick={() => setHasPreferences(false)}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Update Preferences
          </Button>
        )}
      </div>

      {/* Main Content */}
      {!hasPreferences ? (
        <PreferenceSetup />
      ) : recommendations.length === 0 ? (
        <EmptyRecommendationsState />
      ) : (
        <Tabs defaultValue="personalized" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="personalized">For You</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="similar">Similar Users</TabsTrigger>
          </TabsList>

          <TabsContent value="personalized">
            <EmptyRecommendationsState />
          </TabsContent>

          <TabsContent value="paths">
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Learning Paths Available</h3>
                <p className="text-muted-foreground">
                  Curated learning paths will appear here based on your goals
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending">
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trending Content</h3>
                <p className="text-muted-foreground">
                  Popular and trending courses will be shown here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="similar">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Similar User Data</h3>
                <p className="text-muted-foreground">
                  Recommendations based on similar learners will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}