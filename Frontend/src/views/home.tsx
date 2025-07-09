import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    CheckCircle,
    Users,
    FileText,
    Zap,
    ArrowRight,
    Star,
    Play,
    ChevronRight,
    Kanban,
    UserPlus,
    Clock,
    Target,
    Menu,
    X,
    LoaderCircle,
    Github,
} from "lucide-react";
import { Link } from "react-router";
import { API_HEALTH_ENDPOINTS } from "@/api/endpoints";

const TaskFlowLanding = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isServerAwake, setIsServerAwake] = useState(false);
    const [isServerError, setIServerError] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        const healthCheck = async () => {
            const response = await API_HEALTH_ENDPOINTS.getHealth();

            if (response.data.statusCode === 200) {
                console.log("Health check successful");
                setIsServerAwake(true);
            } else {
                console.log("Health check failed");
                setIsServerAwake(true);
                setIServerError(true);
            }
        };

        healthCheck();
    }, []);

    const features = [
        {
            icon: <Kanban className="w-6 h-6" />,
            title: "Kanban Boards",
            description:
                "Visualize your workflow with intuitive drag-and-drop boards",
            status: "To Do → In Progress → Done",
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Team Collaboration",
            description:
                "Assign roles, manage members, and work together seamlessly",
            status: "Admin • Manager • Member",
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Task Management",
            description:
                "Create, assign, and track tasks with priorities and deadlines",
            status: "High • Medium • Low Priority",
        },
        {
            icon: <FileText className="w-6 h-6" />,
            title: "File Attachments",
            description: "Share files, documents, and resources with your team",
            status: "Documents • Images • Files",
        },
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Product Manager",
            company: "TechCorp",
            content:
                "TaskFlow transformed how our team collaborates. The Kanban boards are intuitive and the real-time updates keep everyone aligned.",
            avatar: "SC",
        },
        {
            name: "Mike Rodriguez",
            role: "Team Lead",
            company: "StartupXYZ",
            content:
                "The role-based permissions and task assignment features have streamlined our entire workflow. Highly recommended!",
            avatar: "MR",
        },
        {
            name: "Emma Watson",
            role: "Project Coordinator",
            company: "DesignStudio",
            content:
                "Love the clean interface and powerful features. File attachments and subtasks make project management effortless.",
            avatar: "EW",
        },
    ];

    const stats = [
        { number: "10K+", label: "Active Users" },
        { number: "50K+", label: "Projects Created" },
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/90 border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                TaskFlow
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                                Features
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                                Pricing
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:text-white hover:bg-slate-800"
                            >
                                About
                            </Button>
                            {!isServerAwake && !isServerError ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    <span>Connecting to server...</span>
                                </div>
                            ) : !isServerAwake ? (
                                "Server Unavailable"
                            ) : isServerError ? (
                                "Server Error"
                            ) : (
                                <>
                                    <Button
                                        disabled={
                                            !isServerAwake || isServerError
                                                ? true
                                                : false
                                        }
                                        variant="outline"
                                        className="justify-start border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                        <Link to="/login">Sign In</Link>
                                    </Button>
                                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                                        <Link to={"/app/dashboard"}>
                                            {" "}
                                            Get Started{" "}
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            className="md:hidden text-slate-300"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
                            <div className="flex flex-col space-y-3 pt-4">
                                <Button
                                    variant="ghost"
                                    className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                                >
                                    Features
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                                >
                                    Pricing
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                                >
                                    About
                                </Button>
                                {!isServerAwake && !isServerError ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span>Connecting to server...</span>
                                    </div>
                                ) : !isServerAwake ? (
                                    "Server Unavailable"
                                ) : isServerError ? (
                                    "Server Error"
                                ) : (
                                    <>
                                        <Button
                                            disabled={
                                                !isServerAwake || isServerError
                                                    ? true
                                                    : false
                                            }
                                            variant="outline"
                                            className="justify-start border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                            <Link to="/login">Sign In</Link>
                                        </Button>
                                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                                            <Link to={"/app/dashboard"}>
                                                {" "}
                                                Get Started{" "}
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div
                            className={`space-y-6 lg:space-y-8 transition-all duration-1000 ${
                                isVisible
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="space-y-4">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                                    <Star className="w-3 h-3 mr-1" />
                                    #1 Project Management Tool
                                </Badge>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                                    Streamline Your
                                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        {" "}
                                        Projects
                                    </span>
                                </h1>
                                <p className="text-lg lg:text-xl text-slate-300 leading-relaxed">
                                    Collaborate seamlessly with your team using
                                    our intuitive Kanban boards, task
                                    management, and real-time collaboration
                                    features. Built for modern teams.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
                                >
                                    <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                    Watch Demo
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
                                    onClick={() => {
                                        window.open(
                                            "https://github.com/patiljay956/Task-Management-App",
                                            "_blank",
                                        );
                                    }}
                                >
                                    <Github className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                                    Github
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 pt-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-xl lg:text-2xl font-bold text-white">
                                            {stat.number}
                                        </div>
                                        <div className="text-xs lg:text-sm text-slate-400">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            className={`transition-all duration-1000 delay-300 ${
                                isVisible
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>

                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="relative rounded-2xl shadow-2xl w-full border border-slate-700"
                                >
                                    <source
                                        src="https://res.cloudinary.com/dovggvhlz/video/upload/v1750797648/ohttb8ksniwzjyzoarbp.mp4"
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-20 bg-slate-800/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 lg:mb-16">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
                            Features
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                            Everything you need to manage projects
                        </h2>
                        <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto">
                            From Kanban boards to team collaboration, we've got
                            all the tools your team needs to succeed.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:ring-2 hover: ring-blue-500/50 hover:shadow-blue-500/10"
                            >
                                <CardHeader className="pb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-lg lg:text-xl mb-2 text-white">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs bg-slate-800 text-slate-300 border-slate-600"
                                    >
                                        {feature.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Features Section */}
            <section className="py-16 lg:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 lg:space-y-8">
                            <div>
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
                                    Kanban Boards
                                </Badge>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                                    Visual Project Management
                                </h3>
                                <p className="text-base lg:text-lg text-slate-300 mb-6">
                                    Organize your tasks with intuitive Kanban
                                    boards. Move tasks through To Do, In
                                    Progress, and Done columns with simple
                                    drag-and-drop functionality.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Drag & drop task management
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Priority-based task organization
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Real-time status updates
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl blur-2xl"></div>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="relative rounded-2xl shadow-2xl w-full border border-slate-700"
                            >
                                <source
                                    src="https://res.cloudinary.com/dovggvhlz/video/upload/v1750797654/xct0ynenapkiyepd7ldp.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Collaboration Section */}
            <section className="py-16 lg:py-20 bg-slate-800/30">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-2xl"></div>
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="relative rounded-2xl shadow-2xl w-full border border-slate-700"
                            >
                                <source
                                    src="https://res.cloudinary.com/dovggvhlz/video/upload/v1750797648/bwjem5fnbtnhvg8ijdzw.mp4"
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                            <div>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
                                    Team Management
                                </Badge>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                                    Collaborate with Your Team
                                </h3>
                                <p className="text-base lg:text-lg text-slate-300 mb-6">
                                    Manage team members with role-based
                                    permissions. Assign tasks, track progress,
                                    and ensure everyone stays aligned on project
                                    goals.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Users className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Role-based access control
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <UserPlus className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Easy team member management
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <span className="text-slate-300">
                                            Real-time collaboration
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <Badge className="bg-yellow-100 text-yellow-800 mb-4">
                            Testimonials
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Loved by teams worldwide
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our users have to say about TaskFlow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:ring-2 hover: ring-blue-500/50 hover:shadow-blue-500/10"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-400 mb-6 italic">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                                {testimonial.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-white">
                                                {testimonial.name}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {testimonial.role} at{" "}
                                                {testimonial.company}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">
                            Ready to transform your project management?
                        </h2>
                        <p className="text-xl text-blue-100">
                            Join thousands of teams already using TaskFlow to
                            streamline their workflows and boost productivity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                            >
                                Start Free Trial
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
                            >
                                Contact Sales
                            </Button>
                        </div>
                        <p className="text-blue-200 text-sm">
                            No credit card required • 14-day free trial • Cancel
                            anytime
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">
                                    TaskFlow
                                </span>
                            </div>
                            <p className="text-gray-400">
                                The modern way to manage projects and
                                collaborate with your team.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <div className="space-y-2 text-gray-400">
                                <div>Features</div>
                                <div>Pricing</div>
                                <div>Integrations</div>
                                <div>API</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <div className="space-y-2 text-gray-400">
                                <div>About</div>
                                <div>Blog</div>
                                <div>Careers</div>
                                <div>Contact</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <div className="space-y-2 text-gray-400">
                                <div>Help Center</div>
                                <div>Documentation</div>
                                <div>Community</div>
                                <div>Status</div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 TaskFlow. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TaskFlowLanding;
