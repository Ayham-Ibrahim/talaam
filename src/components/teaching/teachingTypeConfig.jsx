import {
  School,
  Landmark,
  Presentation,
  BookOpen,
  GraduationCap,
  Backpack,
  Calculator,
  FlaskConical,
  Award,
  Lightbulb,
  Briefcase,
  PenTool,
} from "lucide-react";

/**
 * الشرائح الثلاث المسموح بها في /teaching/:type — مطابقة لـ education_type في
 * الباك اند (subjects/stages). "training" هنا يقابل teacher_type = "training_center".
 * أي شريحة أخرى تُعامَل كـ 404 داخل TeachingTypePage.
 */
export const TEACHING_TYPE_SLUGS = ["school", "university", "training"];

/** شريحة الرابط → teacher_type المستخدَم في فلتر بحث المعلمين */
export const SLUG_TO_TEACHER_TYPE = {
  school: "school",
  university: "university",
  training: "training",
};

export const TEACHING_TYPE_CONFIG = {
  school: {
    gradient: { from: "#8FE6F7", to: "#2E7FA0" },
    accent: "#2E7FA0",
    mainIcon: School,
    satellites: [BookOpen, Backpack, Calculator, GraduationCap],
  },
  university: {
    gradient: { from: "#8AA6DE", to: "#2F4A78" },
    accent: "#2F4A78",
    mainIcon: Landmark,
    satellites: [GraduationCap, FlaskConical, BookOpen, PenTool],
  },
  training: {
    gradient: { from: "#F17FB0", to: "#8C0642" },
    accent: "#8C0642",
    mainIcon: Presentation,
    satellites: [Lightbulb, Award, Briefcase, BookOpen],
  },
};
