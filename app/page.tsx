import { ProjectInput } from "@/components/ProjectInput";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Monday Project Generator
            </h1>
            <p className="text-xl text-gray-600">
              Transform your ideas into structured Monday.com projects with AI
            </p>
          </div>
          <ProjectInput />
        </div>
      </main>
    </div>
  );
}
