import { Command } from 'commander';
import { apiFetch } from '../lib/api';

interface Project {
  id: string;
  name: string;
}

async function handleProjects(options: { org?: string }) {
  if (!options.org) {
    console.error('Error: Missing required option --org <orgId>');
    return;
  }

  try {
    const projects = await apiFetch(`/cp/orgs/${options.org}/projects`) as Project[];
    if (projects.length === 0) {
      console.log('No projects found in this organization.');
      return;
    }

    console.log('Projects:');
    projects.forEach(project => {
      console.log(`  - ${project.name} (ID: ${project.id})`);
    });
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to list projects: ${error.message}`);
    } else {
        console.error('An unknown error occurred.');
    }
  }
}

export const projectsCommand = new Command('projects')
  .description('List projects in an organization')
  .requiredOption('--org <orgId>', 'Organization ID')
  .action(handleProjects);
