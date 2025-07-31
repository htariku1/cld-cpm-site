import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Automizer from 'pptx-automizer';
import type { ISlide } from 'pptx-automizer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loes = [], tasks = [], milestones = [] } = body;
    const templateDir = path.join(process.cwd(), 'templates');
    const outputDir = path.join(process.cwd(), 'templates');
    const templateFile = 'brief-template.pptx';
    const outputFile = `brief-output-${Date.now()}.pptx`;

    console.log('Selected items:', loes, tasks, milestones);
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

    // Use the provided objects directly
    const selectedLOEs: any[] = loes;
    const selectedTasks: any[] = tasks;
    const selectedMilestones: any[] = milestones;

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
    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(filePath);
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Clean up after sending
      }
    }

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