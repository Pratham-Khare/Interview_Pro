import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe(
        "A score between 0 and 100 indicating how well the candidate's profile matches the job describe"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The technical question can be asked in the interview"
            ),
            intention: z.string().describe(
                "The intention of interviewer behind asking this question"
            ),
            answer: z.string().describe(
                "How to answer this question, what points to cover, what approach to take etc."
            )
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The technical question can be asked in the interview"
            ),
            intention: z.string().describe(
                "The intention of interviewer behind asking this question"
            ),
            answer: z.string().describe(
                "How to answer this question, what points to cover, what approach to take etc."
            )
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string().describe(
                "The skill which the candidate is lacking"
            ),
            severity: z.enum(["low", "medium", "high"]).describe(
                "The severity of this skill gap"
            )
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    title: z.string()
});


/**
 * @name generateInterviewReport
 * @description Generates a structured interview report using the candidate's
 *              resume, self-description, and job description.
 */
async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `
Generate an interview report for a candidate with the following details:

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    });

    return JSON.parse(response.text);
}


/**
 * @name generatePdfFromHtml
 * @description Converts HTML content into a PDF document using Puppeteer.
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
    headless: true,
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox"
    ]
});

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

/**
 * @name generateResumePdf
 * @description Generates a resume PDF using the candidate's resume,
 *              self-description, and job description.
 */
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    const resumePdfSchema = z.object({
        html: z.string().describe(
            "The HTML content of the resume which can be converted to PDF using puppeteer"
        )
    });

    const prompt = `
Generate resume for a candidate with the following details:

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema)
        }
    });

    const jsonContent = JSON.parse(response.text);

    const pdfBuffer = await generatePdfFromHtml(
        jsonContent.html
    );

    return pdfBuffer;
}

export {
    generateInterviewReport,
    generateResumePdf
};