# Product Overview

**GeradorRCA** (RCA Generator) is an internal web application built for **Olos Tecnologia** to create Root Cause Analysis (RCA) documents for IT incidents.

## Purpose

Streamlines the creation of post-incident RCA reports by providing a structured form-based interface with AI-assisted content generation. Users fill in incident details, timeline, root cause, and action items, then export the final document as PDF or DOCX.

## Key Capabilities

- Structured RCA document editing with section-based navigation (metadata, incident, impact, timeline, root cause, corrective/preventive actions, considerations)
- AI-powered suggestions via AWS Bedrock (Claude models) for content generation
- Export to branded PDF and DOCX with Olos company header/logo
- Per-client export: expand a saved RCA to see affected clients and export individual documents per client (file name suffixed with client name, document shows only that client)
- Dark/light theme support
- Rich text editing for narrative sections
- Admin panel for AI configuration (AWS credentials, model selection)
- Automatic downtime calculation from timeline events (first → last event)
- Option to hide downtime from exported documents
- Reports: Downtime by Client and SLA by Client tables with pagination (15 per page)
- Persistence: RCAs saved to PostgreSQL via Express API server; list, edit, and export saved RCAs

## Domain Context

- RCA = Root Cause Analysis (Análise de Causa Raiz)
- Target users: Olos engineering/operations teams documenting production incidents
- UI language: Brazilian Portuguese
- All user-facing text, labels, prompts, and AI instructions must be in pt-BR
