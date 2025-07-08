import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "TaskFlow",
            link: "https://project-task-management-app.vercel.app/home",
        },
    });

    // Generate email content (HTML & plain text)

    var emailHTML = mailGenerator.generate(options.mailGenContent);
    var emailText = mailGenerator.generatePlaintext(options.mailGenContent);

    const mail = {
        from: '"TaskFlow" <support@taskflow.com>',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML,
    };

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASSWORD,
        },
    });

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("email failed", error);
    }
};

export const emailVerificationMailGenerator = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to TaskFlow! We're thrilled to have you join our community.",
            action: {
                instructions:
                    "To activate your account and start managing your tasks, please verify your email address by clicking the button below:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email Address",
                    link: verificationUrl,
                },
            },
            outro: "If you have any questions or need assistance, simply reply to this email. We're here to help!",
        },
    };
};

export const forgotPasswordMailGenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We received a request to reset your password for your TaskFlow account.",
            action: {
                instructions:
                    "Click the button below to reset your password. If you did not request a password reset, you can safely ignore this email.",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: passwordResetUrl,
                },
            },
            outro: "If you need help or have any questions, just reply to this email. We're here to help!",
        },
    };
};

// project invitation mail generator with project details
export const projectInvitationMailGenContent = (
    username,
    projectName,
    projectDescription,
    projectUrl,
) => {
    return {
        body: {
            name: username,
            intro: `You have been invited to join the project "${projectName}".`,
            table: {
                data: [
                    {
                        Project: projectName,
                        Description: projectDescription,
                    },
                ],
            },
            action: {
                instructions:
                    "To accept the invitation and join the project, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "Join Project",
                    link: projectUrl,
                },
            },
            outro: "If you have any questions or need assistance, simply reply to this email. We're here to help!",
        },
    };
};

// task assignment mail generator with task details and priority
export const taskAssignmentMailGenContent = (
    username,
    taskName,
    taskDescription,
    taskPriority,
    taskUrl,
) => {
    return {
        body: {
            name: username,
            intro: `You have been assigned a new task: "${taskName}".`,
            table: {
                data: [
                    {
                        Task: taskName,
                        Description: taskDescription,
                        Priority: taskPriority,
                    },
                ],
            },
            action: {
                instructions:
                    "To view the task details and start working on it, please click the button below:",
                button: {
                    color: "#22BC66",
                    text: "View Task",
                    link: taskUrl,
                },
            },
            outro: "If you have any questions or need assistance, simply reply to this email. We're here to help!",
        },
    };
};
