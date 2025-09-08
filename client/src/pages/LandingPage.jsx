import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Self-contained SVG Icons for Features ---
const BlockchainIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-4.944c3.996 0 7.523 2.163 9.382 5.44A12.02 12.02 0 0021 11.056a11.955 11.955 0 01-5.382-8.072z"></path></svg>;
const AIIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17.25v2.25c0 .414.336.75.75.75h3c.414 0 .75-.336.75-.75v-2.25M16.5 13.5l-3 3m0 0l-3-3m3 3V6.75m6.75 4.5l-3-3m0 0l-3 3m3-3V1.5"></path></svg>;
const MapIcon = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path></svg>;

// --- NEW: A reusable component for a single FAQ item ---
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-slate-400">{answer}</p>
            </div>
        </div>
    );
};

const LandingPage = () => {
    // Helper function for smooth scrolling
    const handleSmoothScroll = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const faqData = [
        {
            question: "Is my personal data secure?",
            answer: "Absolutely. We use end-to-end encryption for all data transmission. Your Digital ID is generated via our mockchain service, making it tamper-proof, and it's only valid for the duration of your trip. We are committed to the highest standards of data privacy."
        },
        {
            question: "What happens when I press the panic button?",
            answer: "Pressing the panic button instantly shares your live location with the nearest police unit via our command center dashboard. Simultaneously, an alert is sent to your registered emergency contacts, ensuring a rapid and coordinated response."
        },
        {
            question: "Do I have to share my location all the time?",
            answer: "No. Real-time location tracking for your family is an opt-in feature you control. The system only uses your location in the background for automated safety checks, like our geo-fencing and inactivity alerts, to ensure your well-being proactively."
        }
    ];

    return (
        <div className="bg-slate-900 text-slate-200 font-sans">
            {/* --- HEADER --- */}
            <header className="fixed w-full top-0 z-50 bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Tourist Safety Portal</h1>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#features" onClick={handleSmoothScroll} className="hover:text-blue-400 transition-colors">Features</a>
                        <a href="#mobile-app" onClick={handleSmoothScroll} className="hover:text-blue-400 transition-colors">The App</a>
                        <a href="#faq" onClick={handleSmoothScroll} className="hover:text-blue-400 transition-colors">FAQ</a>
                    </nav>
                    <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        Official Login
                    </Link>
                </div>
            </header>

            {/* --- HERO SECTION --- */}
            <main 
                className="h-screen flex flex-col justify-center items-center text-center p-4"
                style={{ backgroundImage: `url(/hero-background.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-slate-900/80"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                        Travel with Confidence.
                    </h2>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mb-8">
                        An intelligent safety system leveraging AI and Blockchain for real-time monitoring and rapid incident response.
                    </p>
                    <a href="#features" onClick={handleSmoothScroll} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl transition-transform transform hover:scale-105">
                        Learn More
                    </a>
                </div>
            </main>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-20 bg-slate-900">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">Our Core Innovations</h3>
                    <p className="text-slate-400 mb-12">The technology safeguarding your journey.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                            <div className="bg-blue-500/20 text-blue-400 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6"><BlockchainIcon /></div>
                            <h4 className="text-xl font-bold text-white mb-2">Blockchain Digital ID</h4>
                            <p className="text-slate-400">Secure, tamper-proof digital identities for tourists, ensuring data integrity and providing authorities with credible information to act upon.</p>
                        </div>
                        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                            <div className="bg-blue-500/20 text-blue-400 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6"><AIIcon /></div>
                            <h4 className="text-xl font-bold text-white mb-2">AI Anomaly Detection</h4>
                            <p className="text-slate-400">Our AI proactively monitors for geo-fence breaches or prolonged inactivity, flagging potential distress situations before they escalate.</p>
                        </div>
                        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                             <div className="bg-blue-500/20 text-blue-400 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6"><MapIcon /></div>
                            <h4 className="text-xl font-bold text-white mb-2">Live Command Center</h4>
                            <p className="text-slate-400">A real-time dashboard for officials with satellite maps, incident triage, and instant communication channels to tourists and family.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- THE APP IN ACTION SECTION --- */}
            <section id="mobile-app" className="py-20 bg-slate-800/50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <img 
                            src="/app-in-action.jpg" 
                            alt="Mobile app interface" 
                            className="rounded-2xl shadow-2xl mx-auto"
                        />
                    </div>
                    <div className="md:w-1/2 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-white mb-4">Your Safety, in Your Pocket</h3>
                        <p className="text-slate-400 mb-8">
                            The tourist mobile app is your direct link to the safety network. It's designed for simplicity and reliability when you need it most.
                        </p>
                        <ul className="space-y-4 text-slate-300">
                            <li className="flex items-start"><span className="text-blue-400 font-bold mr-3">✓</span><div><strong className="text-white">One-Tap SOS:</strong> Instantly alert authorities and your family with a single press of the panic button.</div></li>
                            <li className="flex items-start"><span className="text-blue-400 font-bold mr-3">✓</span><div><strong className="text-white">Smart Geo-Alerts:</strong> Receive automatic notifications if you approach a known high-risk or restricted area.</div></li>
                            <li className="flex items-start"><span className="text-blue-400 font-bold mr-3">✓</span><div><strong className="text-white">Opt-In Family Tracking:</strong> Give your loved ones peace of mind by sharing your live location through a secure portal. You are always in control.</div></li>
                        </ul>
                    </div>
                </div>
            </section>
            
            {/* --- NEW: FAQ SECTION --- */}
            <section id="faq" className="py-20 bg-slate-900">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white">Frequently Asked Questions</h3>
                        <p className="text-slate-400">Your most common questions, answered.</p>
                    </div>
                    <div>
                        {faqData.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-900 py-10">
                <div className="container mx-auto px-6 text-center text-slate-400">
                    <p className="text-sm mt-2">A project for the Smart India Hackathon 2025.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;