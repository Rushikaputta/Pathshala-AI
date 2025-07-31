
"use server";

import {
  generateLocalContent,
  GenerateLocalContentInput,
  GenerateLocalContentOutput,
} from "@/ai/flows/generate-local-content";
import {
  generateVisualAid,
  GenerateVisualAidInput,
  GenerateVisualAidOutput,
} from "@/ai/flows/visual-aid-generation";
import {
  generateDifferentiatedWorksheet,
  GenerateDifferentiatedWorksheetInput,
  GenerateDifferentiatedWorksheetOutput,
} from "@/ai/flows/differentiated-worksheet-generation";
import {
  readingAssessment,
  ReadingAssessmentInput,
  ReadingAssessmentOutput,
} from "@/ai/flows/reading-assessment";
import {
  generateGame,
  GenerateGameInput,
  GenerateGameOutput,
} from "@/ai/flows/game-generator";
import {
  generateLessonPlan,
  GenerateLessonPlanInput,
  GenerateLessonPlanOutput,
} from "@/ai/flows/lesson-planner";
import {
  generateAssignment,
  GenerateAssignmentInput,
  GenerateAssignmentOutput,
} from "@/ai/flows/assignment-generator";
import {
  evaluateAssignment,
  EvaluateAssignmentInput,
  EvaluateAssignmentOutput,
} from "@/ai/flows/assignment-evaluator";
import {
  navigationAssistant,
  NavigationAssistantInput,
  NavigationAssistantOutput,
} from "@/ai/flows/navigation-assistant";
import {
  speechToText,
  SpeechToTextInput,
  SpeechToTextOutput,
} from "@/ai/flows/speech-to-text";
import {
  readAloud,
  ReadAloudInput,
  ReadAloudOutput,
} from "@/ai/flows/read-aloud";
import {
  generateStory,
  GenerateStoryInput,
  GenerateStoryOutput,
} from "@/ai/flows/story-generator";

export async function generateLocalContentAction(
  values: GenerateLocalContentInput
): Promise<GenerateLocalContentOutput> {
  return await generateLocalContent(values);
}

export async function generateDifferentiatedWorksheetAction(
  values: GenerateDifferentiatedWorksheetInput
): Promise<GenerateDifferentiatedWorksheetOutput> {
  return await generateDifferentiatedWorksheet(values);
}

export async function generateVisualAidAction(
  values: GenerateVisualAidInput
): Promise<GenerateVisualAidOutput> {
  return await generateVisualAid(values);
}

export async function readingAssessmentAction(
  values: ReadingAssessmentInput
): Promise<ReadingAssessmentOutput> {
  return await readingAssessment(values);
}

export async function generateGameAction(
  values: GenerateGameInput
): Promise<GenerateGameOutput> {
  return await generateGame(values);
}

export async function generateLessonPlanAction(
  values: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput> {
  return await generateLessonPlan(values);
}

export async function generateAssignmentAction(
  values: GenerateAssignmentInput
): Promise<GenerateAssignmentOutput> {
  return await generateAssignment(values);
}

export async function evaluateAssignmentAction(
  values: EvaluateAssignmentInput
): Promise<EvaluateAssignmentOutput> {
  return await evaluateAssignment(values);
}

export async function navigationAssistantAction(
  values: NavigationAssistantInput
): Promise<NavigationAssistantOutput> {
  return await navigationAssistant(values);
}

export async function speechToTextAction(
  values: SpeechToTextInput
): Promise<SpeechToTextOutput> {
  return await speechToText(values);
}

export async function readAloudAction(
  values: ReadAloudInput
): Promise<ReadAloudOutput> {
  return await readAloud(values);
}

export async function generateStoryAction(
  values: GenerateStoryInput
): Promise<GenerateStoryOutput> {
  return await generateStory(values);
}
