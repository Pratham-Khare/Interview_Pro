import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import UserNavbar from "../../auth/components/UserNavbar"
import UpgradePopup from "../../subscription/components/UpgradePopup"
import toast, { Toaster } from 'react-hot-toast'

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [showUpgradePopup, setShowUpgradePopup] = useState(false)
    const [fileName, setFileName] = useState("") 
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {

        if (!jobDescription.trim()) {
            toast.error("Job description is required!", {
                duration: 4000,
                position: 'top-center',
                style: { 
                    background: '#1a0a2e', 
                    color: '#fff', 
                    border: '1px solid #ff4b4b',
                    borderRadius: '10px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#ff4b4b',
                    secondary: '#fff',
                },
            });
            return;
        }

        try {

            const resumeFile = resumeInputRef.current.files[0]

            if (!resumeFile) {
                toast.error("Please upload your resume first!", {
                    duration: 4000,
                    position: 'top-center',
                    style: { 
                        background: '#1a0a2e', 
                        color: '#fff', 
                        border: '1px solid #ff4b4b',
                        borderRadius: '10px',
                        padding: '16px',
                    },
                    iconTheme: {
                        primary: '#ff4b4b',
                        secondary: '#fff',
                    },
                });
                return;
            }

            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            if (data?._id) {
                navigate(`/interview/${data._id}`)
            }

        } catch (error) {
            // Updated logic to handle the 403 Forbidden / NO_TOKENS error[cite: 10, 11]
            if (error.message === "NO_TOKENS") {
                setShowUpgradePopup(true); // Open the popup[cite: 10]
                
                toast.error("You have run out of tokens!", {
                    duration: 3000,
                    position: 'top-center',
                    style: { 
                        background: '#1a0a2e', 
                        color: '#fff', 
                        border: '1px solid #a855f7',
                        borderRadius: '10px',
                        padding: '16px',
                    },
                });

                // REDIRECTION: Allow 2 seconds for the popup/toast to be visible[cite: 10]
                setTimeout(() => {
                    navigate("/subscription");
                }, 2000); 
            } else {
                toast.error("Failed to generate strategy. Please try again.");
            }
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name); // Updates the UI with the file name[cite: 10]
            
            toast.success(`Resume uploaded successfully!`, {
                duration: 4000,
                position: 'top-center',
                style: { 
                    background: '#1a0a2e', 
                    color: '#fff', 
                    border: '1px solid #22c55e', 
                    borderRadius: '10px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                },
            });
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <Toaster position="top-center" reverseOrder={false} />
            
            <UserNavbar />
            <div className='home-container'>

                <section className='hero-section'>
                    <div className='hero-badge'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        AI-POWERED STRATEGY
                    </div>
                    <h1 className='hero-title'>
                        Create Your Custom<br />
                        <span className='hero-title--gradient'>Interview Plan</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Tailor your preparation strategy based on the specific job role and your unique experience. Our AI analyzes your fit and identifies potential gaps.
                    </p>
                </section>

                <div className='form-grid'>

                    <div className='form-card form-card--left'>
                        <div className='form-card__header'>
                            <div className='form-card__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </div>
                            <h2 className='form-card__title'>Target Job Description</h2>
                        </div>
                        <div className='form-card__body'>
                            <textarea
                                onChange={(e) => { setJobDescription(e.target.value) }}
                                className='form-textarea'
                                placeholder='Paste the full job description here. Include responsibilities, requirements, and company info for better accuracy...'
                                maxLength={5000}
                                value={jobDescription}
                            />
                            <div className='form-footer'>
                                <span className='form-footer__text'>Made By Pratham Khare</span>
                            </div>
                        </div>
                    </div>

                    <div className='form-card form-card--right'>
                        <div className='form-card__header'>
                            <div className='form-card__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h2 className='form-card__title'>Your Profile</h2>
                        </div>
                        <div className='form-card__body'>

                            <div className='upload-wrapper'>
                                <label className='upload-label'>Upload Resume</label>
                                <label className='dropzone' htmlFor='resume'>
                                    <div className='dropzone__content'>
                                        {fileName ? (
                                            <>
                                                <div className='dropzone__icon'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                    </svg>
                                                </div>
                                                <p className='dropzone__title' style={{ color: '#a855f7' }}>{fileName}</p>
                                                <p className='dropzone__subtitle'>Click to change file</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className='dropzone__icon'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2v13M8 11l4-4 4 4" />
                                                    </svg>
                                                </div>
                                                <p className='dropzone__title'>Drop your resume here</p>
                                                <p className='dropzone__subtitle'>PDF, DOCX up to 10MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        ref={resumeInputRef} 
                                        hidden 
                                        type='file' 
                                        id='resume' 
                                        name='resume' 
                                        accept='.pdf,.docx' 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            </div>

                            <div className='self-desc-wrapper'>
                                <label className='upload-label' htmlFor='selfDescription'>Quick Self-Description</label>
                                <textarea
                                    onChange={(e) => { setSelfDescription(e.target.value) }}
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='form-textarea form-textarea--compact'
                                    placeholder='Briefly describe your career goals or specific areas you want to focus on...'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='cta-section'>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-button'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        Generate My Interview Strategy
                    </button>
                    <p className='cta-note'>Takes about 30 seconds to analyze. You can preview the plan before saving.</p>
                </div>

                {reports.length > 0 && (
                    <section className='recent-section'>
                        <div className='recent-header'>
                            <h2 className='recent-title'>My Recent Interview Plans</h2>
                            <p className='recent-subtitle'>Review and manage your AI-generated interview prep materials.</p>
                        </div>
                        <div className='reports-grid'>
                            {reports.map(report => (
                                <div key={report._id} className='report-card' onClick={() => navigate(`/interview/${report._id}`)}>
                                    <div className='report-card__badge'>
                                        {report.matchScore >= 80 ? 'HIGH MATCH' : report.matchScore >= 60 ? 'GOOD MATCH' : 'NEEDS WORK'}
                                    </div>
                                    <h3 className='report-card__title'>{report.title || 'Untitled Position'}</h3>
                                    <div className='report-card__meta'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        Generated on {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className='report-card__tags'>
                                        <span className='skill-tag'>JS</span>
                                        <span className='skill-tag'>TS</span>
                                        <span className='skill-tag'>RE</span>
                                    </div>
                                    <div className='report-card__footer'>
                                        <div className='match-indicator'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                            </svg>
                                            Match Score: {report.matchScore}%
                                        </div>
                                        <span className='view-link'>
                                            View Plan
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <footer className='page-footer'>
                    <div className='footer-brand'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        InterviewForge
                    </div>
                    <div className='footer-links'>
                        <a href='#'>Privacy Policy</a>
                        <a href='#'>Terms of Service</a>
                        <a href='#'>Help Center</a>
                    </div>
                    <div className='footer-copyright'>
                        © 2026 InterviewForge. All rights reserved.
                    </div>
                </footer>

                <UpgradePopup
                    open={showUpgradePopup}
                    onClose={() => setShowUpgradePopup(false)}
                />
            </div>
        </div>
    )
}

export default Home