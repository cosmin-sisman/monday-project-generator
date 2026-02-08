import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { ProjectStructure } from "@/components/ProjectStructure";
import { MondaySelector } from "@/components/MondaySelector";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      groups:project_groups(
        *,
        tasks:project_tasks(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <ProjectStructure
            initialProject={project}
            onUpdate={() => {}}
          />

          <div className="mt-8">
            <MondaySelector projectId={project.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
