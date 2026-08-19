import type { ProjectDocument } from "../types";

type GitHubContent = {
  name: string;
  path: string;
  html_url: string;
  download_url: string | null;
  sha: string;
};

export class GitHubDocumentRepository {
  constructor(
    private readonly repository: string,
    private readonly token?: string,
  ) {}

  async listReceipts(): Promise<ProjectDocument[]> {
    const response = await fetch(
      `https://api.github.com/repos/${this.repository}/contents/receipts`,
      {
        headers: this.token
          ? { Authorization: `Bearer ${this.token}` }
          : undefined,
        next: { revalidate: 300 },
      },
    );

    if (response.status === 404) return [];
    if (!response.ok) throw new Error("GitHub receipt sync failed");

    const files = (await response.json()) as GitHubContent[];
    return files.map((file) => ({
      id: file.sha,
      projectId: file.path.split("/")[1] ?? "unassigned",
      investorId: null,
      title: file.name.replace(/[-_]/g, " "),
      fileUrl: file.download_url ?? file.html_url,
      uploadedDate: new Date().toISOString().slice(0, 10),
      type: "receipt",
    }));
  }
}
