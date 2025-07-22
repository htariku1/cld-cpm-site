import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Automizer from 'pptx-automizer';
import type { ISlide } from 'pptx-automizer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loeIds = [], taskIds = [], milestoneIds = [] } = body;
    const templateDir = path.join(process.cwd(), 'templates');
    const outputDir = path.join(process.cwd(), 'templates');
    const templateFile = 'brief-template.pptx';
    const outputFile = `brief-output-${Date.now()}.pptx`;

    console.log('Selected items:', loeIds, taskIds, milestoneIds);
    console.log('Template path:', path.join(templateDir, templateFile));
    console.log('Output path:', path.join(outputDir, outputFile));

    const automizer = new Automizer({
      templateDir,
      outputDir,
      removeExistingSlides: false,
      autoImportSlideMasters: true,
    });

    // Load the template with a label and use the label in addSlide
    let pres = automizer.loadRoot(templateFile).load(templateFile, 'template');

    // Sample data for LOEs, tasks, and milestones (copied from lib/data-context.tsx)
    const sampleLOEs = [
      {
        id: "loe-1",
        name: "LOE 1: Capture Capability Requirements and Current Solutions",
        purpose: "Identify mission needs, capability requirements, and current solutions",
        startDate: "2025-07-01",
        endDate: "2025-10-31",
        deliverable: "Capability Requirements Portfolio",
        leadOrg: "CPMR",
        supportingOrg: "IAPR, TMTR",
        cpmrContributions:
          "Identify CRs from JCCL (JWC 3.0, KOPS, CRCs, etc.), assess against reference architecture/design",
        iaprContributions:
          "Provide current & emerging acquisition solutions aligned to JCCL CRs (Supply Classes III, V, VIII)",
        tmtrContributions: "Offer tech modernization solutions; inventory R&D initiatives and modernizable PORs",
        overallHealth: "Good",
      },
      {
        id: "loe-2",
        name: "LOE 2: Gap and Current Solutions Health Analysis",
        purpose: "Assess gaps, solution health, and programmatic risk",
        startDate: "2025-09-01",
        endDate: "2026-01-31",
        deliverable: "Gap Analysis and Health Assessment Report",
        leadOrg: "CPMR",
        supportingOrg: "IAPR, TMTR",
        cpmrContributions: "Trace capability requirements to solutions and gaps",
        iaprContributions: "Assess health/risk of acquisition programs to inform investment/divestment",
        tmtrContributions: "Assess risk of R&D initiatives in terms of timely delivery of tech/functionality",
        overallHealth: "At Risk",
      },
      {
        id: "loe-3",
        name: "LOE 3: Solutions Options Development",
        purpose: "Identify solution options and alternatives to close gaps and mitigate risk",
        startDate: "2026-01-01",
        endDate: "2026-03-31",
        deliverable: "Solutions Options Portfolio",
        leadOrg: "IAPR, TMTR",
        supportingOrg: "CPMR",
        cpmrContributions: "Provide capability solution options traced to CRs and gaps",
        iaprContributions: "Identify alternative and commercial solutions; highlight duplicates or misaligned solutions",
        tmtrContributions: "Identify innovative alternatives to close high-risk gaps or render capabilities obsolete",
        overallHealth: "Good",
      },
      {
        id: "loe-4",
        name: "LOE 4: Synthesize All Risks for Decision Support",
        purpose: "Weigh risks and opportunities within the tradespace",
        startDate: "2026-02-15",
        endDate: "2026-04-30",
        deliverable: "Risk Synthesis and Decision Support Package",
        leadOrg: "CPMR, IAPR, TMTR",
        supportingOrg: "—",
        cpmrContributions: "Assess operational/residual risk per capability solution across time horizons",
        iaprContributions: "Recommend acquisition approaches; highlight risks, alternatives, and divestments",
        tmtrContributions: "Prioritize R&D/alternatives to meet CRs with categorized risk levels (high to low)",
        overallHealth: "Good",
      },
    ];

    const sampleTasks = [
      {
        id: "task-1",
        name: "Requirements Analysis",
        owner: "John Smith",
        loeId: "loe-1",
        description: "Analyze current capability requirements",
        startDate: "2025-07-15",
        endDate: "2025-09-30",
        status: "In Progress",
        deliverable: "Requirements Document",
        type: "formal",
        category: "deployment",
        assignedTypes: ["CPMR", "IAPR"],
        internalCoord: ["JS J4", "OSD ER&O"],
        externalCoord: ["Army", "Navy"],
        issues: ["Resource allocation pending", "Timeline constraints"],
      },
      {
        id: "task-2",
        name: "Solution Assessment",
        owner: "Jane Doe",
        loeId: "loe-1",
        description: "Assess current acquisition solutions",
        startDate: "2025-08-15",
        endDate: "2025-10-15",
        status: "Not Started",
        deliverable: "Assessment Report",
        type: "formal",
        category: "sustainment",
        assignedTypes: ["IAPR"],
        internalCoord: ["OSD (MR)"],
        externalCoord: ["Air Force", "USTRANSCOM"],
        issues: [],
      },
      // ... (add more sample tasks as needed)
    ];

    const sampleMilestones = [
      {
        id: "milestone-1",
        name: "Requirements Review",
        description: "Review of all capability requirements",
        date: "2025-09-30",
        leadOrg: "CPMR",
        supportingOrg: "IAPR, TMTR",
        deliverable: "Approved Requirements",
        loeIds: ["loe-1"],
      },
      {
        id: "milestone-2",
        name: "Gap Analysis Complete",
        description: "Completion of gap analysis phase",
        date: "2025-12-15",
        leadOrg: "CPMR",
        supportingOrg: "IAPR, TMTR",
        deliverable: "Gap Analysis Report",
        loeIds: ["loe-2"],
      },
      // ... (add more sample milestones as needed)
    ];

    // Lookup and format details for PowerPoint
    const selectedLOEs = sampleLOEs.filter(loe => loeIds.includes(loe.id));
    const selectedTasks = sampleTasks.filter(task => taskIds.includes(task.id));
    const selectedMilestones = sampleMilestones.filter(milestone => milestoneIds.includes(milestone.id));

    // For each LOE, add a slide
    selectedLOEs.forEach(loe => {
      pres = pres.addSlide('template', 1, (slide: ISlide) => {
        slide.generate((pptxGenJSSlide: any) => {
          pptxGenJSSlide.addText(
            `LOE: ${loe.name}\nPurpose: ${loe.purpose}\nStart: ${loe.startDate} End: ${loe.endDate}\nDeliverable: ${loe.deliverable}\nLead Org: ${loe.leadOrg}\nSupporting Org: ${loe.supportingOrg}\nCPMR: ${loe.cpmrContributions}\nIAPR: ${loe.iaprContributions}\nTMTR: ${loe.tmtrContributions}\nHealth: ${loe.overallHealth}`,
            { x: 1, y: 1, w: 8, h: 5, fontSize: 18 }
          );
        });
      });
    });
    // For each Task, add a slide
    selectedTasks.forEach(task => {
      pres = pres.addSlide('template', 1, (slide: ISlide) => {
        slide.generate((pptxGenJSSlide: any) => {
          pptxGenJSSlide.addText(
            `Task: ${task.name}\nOwner: ${task.owner}\nStatus: ${task.status}\nDescription: ${task.description}\nStart: ${task.startDate} End: ${task.endDate}\nDeliverable: ${task.deliverable}\nType: ${task.type}\nCategory: ${task.category}\nAssigned Types: ${(task.assignedTypes || []).join(', ')}\nInternal Coord: ${(task.internalCoord || []).join(', ')}\nExternal Coord: ${(task.externalCoord || []).join(', ')}\nIssues: ${(Array.isArray(task.issues) ? task.issues.join(', ') : task.issues)}`,
            { x: 1, y: 1, w: 8, h: 5, fontSize: 18 }
          );
        });
      });
    });
    // For each Milestone, add a slide
    selectedMilestones.forEach(milestone => {
      pres = pres.addSlide('template', 1, (slide: ISlide) => {
        slide.generate((pptxGenJSSlide: any) => {
          pptxGenJSSlide.addText(
            `Milestone: ${milestone.name}\nDescription: ${milestone.description}\nDate: ${milestone.date}\nLead Org: ${milestone.leadOrg}\nSupporting Org: ${milestone.supportingOrg}\nDeliverable: ${milestone.deliverable}`,
            { x: 1, y: 1, w: 8, h: 5, fontSize: 18 }
          );
        });
      });
    });

    await pres.write(outputFile);
    const filePath = path.join(outputDir, outputFile);
    const fileBuffer = fs.readFileSync(filePath);
    fs.unlinkSync(filePath); // Clean up after sending

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="brief-output.pptx"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PowerPoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 