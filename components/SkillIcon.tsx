import Image from "next/image";
import { Blocks, Braces, Compass, Cuboid, Factory, GitPullRequest, Network, UsersRound, type LucideIcon } from "lucide-react";

const logos: Record<string, string> = {
  "C#": "devicon/csharp",
  TypeScript: "devicon/typescript",
  JavaScript: "devicon/javascript",
  Java: "devicon/java",
  ".NET": "devicon/dot-net",
  "Node.js": "devicon/nodejs",
  GraphQL: "devicon/graphql",
  RabbitMQ: "devicon/rabbitmq",
  React: "devicon/react",
  Redux: "devicon/redux",
  AngularJS: "devicon/angularjs",
  "SQL Server": "devicon/microsoftsqlserver",
  PostgreSQL: "devicon/postgresql",
  MySQL: "devicon/mysql",
  MongoDB: "devicon/mongodb",
  Redis: "devicon/redis",
  AWS: "devicon/amazonwebservices",
  "Azure DevOps": "devicon/azuredevops",
  Docker: "devicon/docker",
  Jenkins: "devicon/jenkins",
  "GitHub Actions": "devicon/githubactions",
  Git: "devicon/git",
  GitHub: "devicon/github",
  GitLab: "devicon/gitlab",
  Postman: "devicon/postman",
  Figma: "devicon/figma",
  Windows: "devicon/windows11",
  Linux: "devicon/linux",
  macOS: "devicon/apple",
};

const symbols: Record<string, LucideIcon> = {
  "System Architecture": Blocks,
  "Distributed Systems": Network,
  "Manufacturing Software": Factory,
  "Geometry Processing": Cuboid,
  "Technical Leadership": Compass,
  Mentoring: UsersRound,
  "Code Reviews": GitPullRequest,
};

export function SkillIcon({ name }: { name: string }) {
  const logo = logos[name];
  if (logo) {
    return (
      <Image
        src={`/icons/${logo}.svg`}
        alt=""
        aria-hidden="true"
        width={18}
        height={18}
        unoptimized
        className={`skill-icon${["AWS", "GitHub", "GitHub Actions", "macOS"].includes(name) ? " skill-icon-monochrome" : ""}`}
      />
    );
  }

  const Icon = symbols[name] ?? Braces;
  return <Icon size={18} strokeWidth={1.7} className="skill-icon text-forest" aria-hidden="true" />;
}