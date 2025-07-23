import { createTransport, Transporter } from 'nodemailer'
import { createElement, ReactElement, ComponentType } from 'react'
import { renderToString } from 'react-dom/server'

let transporter: Transporter

interface MailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

export function mailConnect(config: MailConfig) {
	transporter = createTransport(config)
}

interface MailSenderProps {
  from: string;
  to: string;
  subject: string;
  element: ReactElement | ComponentType<any>;
}

export const MailSender = ({ from, to, subject, element }: MailSenderProps) => {
	const html = renderToString(
		typeof element === 'function' 
			? createElement(element)
			: element
	)
	return transporter?.sendMail({ from, to, subject, html })
}