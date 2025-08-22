import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  Target,
  Brain,
  Award,
  BookOpen,
  Calendar,
  Eye,
  AlertCircle,
  CheckCircle,
  Zap,
  Filter,
  Download,
  Share,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

interface LearningMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface PerformanceData {
  date: string;
  completionRate: number;
  timeSpent: number;
  quizScore: number;
  engagement: number;
}

interface CourseAnalytics {
  courseName: string;
  enrollments: number;
  completionRate: number;
  averageRating: number;
  dropoffRate: number;
  timeToComplete: number;
}

interface PredictiveInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'success';
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

// Clean state - no mock metrics
const learningMetrics: LearningMetric[] = [];

// Clean state - no mock performance data
const performanceData: PerformanceData[] = [];

// Clean state - no mock course analytics
const courseAnalytics: CourseAnalytics[] = [];

// Clean state - no mock skill distribution
const skillDistribution: any[] = [];

// Clean state - no mock insights
const predictiveInsights: PredictiveInsight[] = [];

const timeFrames = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '1y', label: 'Last year' }
];

export function AdvancedAnalytics() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'opportunity': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Empty state components
  const EmptyAnalyticsState = () => (
    <motion.div 
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <BarChart3 className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-4">No Analytics Data Available</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Analytics will appear here once students start taking courses and engaging with content. 
        Create courses and attract learners to generate insights.
      </p>
      <div className="space-y-3">
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-500">
          <Brain className="h-4 w-4 mr-2" />
          Get Started with Courses
        </Button>
        <p className="text-sm text-muted-foreground">
          Data will be collected automatically as users engage with your platform
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📊 Advanced Analytics
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive insights into learning performance and platform metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFrames.map(frame => (
                  <SelectItem key={frame.value} value={frame.value}>
                    {frame.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Show empty state when no data */}
        {learningMetrics.length === 0 && performanceData.length === 0 && courseAnalytics.length === 0 ? (
          <EmptyAnalyticsState />
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {learningMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${metric.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                      <metric.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend, metric.change)}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 
                        metric.trend === 'down' ? 'text-red-600 dark:text-red-400' : 
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold">{metric.value}</h3>
                    <p className="text-sm font-medium">{metric.title}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Course Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Skill Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Learning Progress Trends
                    </CardTitle>
                    <CardDescription>Course completion and engagement over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="completionRate" 
                          stackId="1"
                          stroke="#3B82F6" 
                          fill="url(#colorCompletion)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="engagement" 
                          stackId="2"
                          stroke="#8B5CF6" 
                          fill="url(#colorEngagement)" 
                        />
                        <defs>
                          <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Quiz Performance
                    </CardTitle>
                    <CardDescription>Average quiz scores and learning hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="quizScore" fill="url(#gradientBar)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#34D399" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Engagement Heatmap
                  </CardTitle>
                  <CardDescription>Daily learning activity patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 * 8 }, (_, i) => {
                      const intensity = Math.random();
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.01 }}
                          className={`aspect-square rounded-lg ${
                            intensity > 0.7 ? 'bg-green-500' :
                            intensity > 0.4 ? 'bg-green-300' :
                            intensity > 0.2 ? 'bg-green-100' :
                            'bg-gray-100 dark:bg-gray-700'
                          } hover:scale-110 transition-transform cursor-pointer`}
                          title={`Activity level: ${Math.round(intensity * 100)}%`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>Less active</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded" />
                      <div className="w-3 h-3 bg-green-100 rounded" />
                      <div className="w-3 h-3 bg-green-300 rounded" />
                      <div className="w-3 h-3 bg-green-500 rounded" />
                    </div>
                    <span>More active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {courseAnalytics.map((course, index) => (
                <motion.div
                  key={course.courseName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{course.courseName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.enrollments.toLocaleString()} students enrolled
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            ⭐ {course.averageRating}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Completion Rate</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold">{course.completionRate}%</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <Progress value={course.completionRate} className="h-2" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Dropout Rate</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold">{course.dropoffRate}%</span>
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            </div>
                            <Progress value={course.dropoffRate} className="h-2" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-lg font-semibold">{course.timeToComplete}w</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Performance</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              course.completionRate >= 80 ? 'bg-green-500' :
                              course.completionRate >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">
                              {course.completionRate >= 80 ? 'Excellent' :
                               course.completionRate >= 60 ? 'Good' : 'Needs Attention'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {predictiveInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Card className={`border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${getInsightColor(insight.type)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{insight.title}</h3>
                              <p className="text-muted-foreground mt-1">{insight.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact} impact
                              </Badge>
                              <Badge variant="outline">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                          </div>

                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-sm">AI Recommendation</span>
                            </div>
                            <p className="text-sm">{insight.recommendation}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Confidence Level:</span>
                            <Progress value={insight.confidence} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{insight.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-500" />
                      Skill Distribution
                    </CardTitle>
                    <CardDescription>Learning focus across different domains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <RechartsPieChart 
                          data={skillDistribution} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={100} 
                          dataKey="value"
                        >
                          {skillDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Skill Progress
                    </CardTitle>
                    <CardDescription>Individual skill advancement levels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillDistribution.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-sm text-muted-foreground">{skill.value}%</span>
                        </div>
                        <Progress value={skill.value} className="h-2" />
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}