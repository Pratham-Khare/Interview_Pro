import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    /**
     * @description Generates a new interview report and handles token-based error catching.
     */
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            // Check specifically for 403 Forbidden status and the "NO_TOKENS" message[cite: 11]
            if (error?.response?.status === 403 && error?.response?.data?.message === "NO_TOKENS") {
                // This specific error string is required to trigger the popup in Home.jsx[cite: 10, 11]
                throw new Error("NO_TOKENS") 
            }
            console.error("Report generation error:", error)
            throw error // Re-throw other errors so the calling component can handle them
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.error("Fetch report by ID error:", error)
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.error("Fetch all reports error:", error)
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const pdfBlob = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")

            link.href = url
            link.download = `resume_${interviewReportId}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error("PDF download failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const shareInterviewReport = async (interviewReportId) => {
        try {
            const pdfBlob = await generateResumePdf({ interviewReportId })
            const file = new File(
                [pdfBlob],
                `interview_report_${interviewReportId}.pdf`,
                { type: "application/pdf" }
            )

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: "AI Interview Report",
                    text: "Check out my AI-generated interview preparation report.",
                    files: [file]
                })
            } else {
                const url = window.URL.createObjectURL(pdfBlob)
                const link = document.createElement("a")
                link.href = url
                link.download = `interview_report_${interviewReportId}.pdf`
                link.click()
            }
        } catch (error) {
            console.error("Share failed:", error)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf,
        shareInterviewReport
    }
}