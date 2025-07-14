// Database types matching Supabase schema
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  homepage_url?: string;
  repo_url?: string;
  license?: string;
  status: 'active' | 'stale' | 'deprecated';
  tags?: string[];
  visibility: boolean;
  submitter_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface StackComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'ci_cd' | 'devops' | 'tooling' | 'runtime';
  official_url?: string;
  description?: string;
  icon_url?: string;
  created_at: string;
}

export interface ProjectStack {
  project_id: string;
  stack_component_id: string;
}

export interface Metrics {
  project_id: string;
  stars?: number;
  forks?: number;
  open_issues?: number;
  contributors_count?: number;
  last_commit_at?: string;
  last_release_at?: string;
  first_commit_at?: string;
  language_stats?: any;
  updated_at?: string;
}

export interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  link?: string;
  created_at: string;
}

// NEW TYPES FOR OPEN SOURCE FEATURES

export interface Contributor {
  id: string;
  project_id: string;
  name: string;
  github_username?: string;
  avatar_url?: string;
  role: 'maintainer' | 'core_contributor' | 'contributor' | 'founder';
  bio?: string;
  website_url?: string;
  twitter_username?: string;
  linkedin_url?: string;
  is_active: boolean;
  joined_at: string;
  contributions_count: number;
  created_at: string;
}

export interface Sponsor {
  id: string;
  project_id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  type: 'individual' | 'company' | 'organization' | 'foundation';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  amount_monthly?: number;
  currency: string;
  description?: string;
  is_active: boolean;
  started_at: string;
  created_at: string;
}

export interface CommunityLink {
  id: string;
  project_id: string;
  platform: 'discord' | 'slack' | 'reddit' | 'twitter' | 'linkedin' | 'telegram' | 'matrix' | 'forum' | 'mailing_list' | 'other';
  url: string;
  name?: string;
  member_count?: number;
  is_active: boolean;
  created_at: string;
}

export interface ContributingInfo {
  id: string;
  project_id: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  setup_time_minutes?: number;
  contributing_guide_url?: string;
  code_of_conduct_url?: string;
  good_first_issues_count: number;
  documentation_url?: string;
  development_setup_guide?: string;
  testing_guide?: string;
  preferred_languages?: string[];
  requires_cla: boolean;
  has_mentorship: boolean;
  hacktoberfest_friendly: boolean;
  updated_at: string;
  created_at: string;
}

export interface ProjectHealth {
  project_id: string;
  health_score?: number;
  bus_factor?: number;
  avg_time_to_close_issue_days?: number;
  avg_time_to_merge_pr_days?: number;
  activity_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  community_engagement_score?: number;
  documentation_quality_score?: number;
  last_calculated_at: string;
}

export interface GettingStartedGuide {
  id: string;
  project_id: string;
  title: string;
  content: string;
  order_index: number;
  estimated_time_minutes?: number;
  prerequisites?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface ProjectWithStack extends Project {
  stack_components: StackComponent[];
  metrics?: Metrics;
  roadmap_items?: RoadmapItem[];
  contributors?: Contributor[];
  sponsors?: Sponsor[];
  community_links?: CommunityLink[];
  contributing_info?: ContributingInfo;
  project_health?: ProjectHealth;
  getting_started_guides?: GettingStartedGuide[];
}

export interface ProjectFormData {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  homepage_url?: string;
  repo_url?: string;
  license?: string;
  status: 'active' | 'stale' | 'deprecated';
  tags?: string[];
  visibility: boolean;
  stack_components: string[]; // Array of component IDs
}

// Search and filtering types
export interface ProjectFilters {
  search?: string;
  status?: 'active' | 'stale' | 'deprecated';
  tags?: string[];
  stack_types?: Array<'frontend' | 'backend' | 'database' | 'ci_cd' | 'devops' | 'tooling' | 'runtime'>;
  visibility?: boolean;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  has_mentorship?: boolean;
  hacktoberfest_friendly?: boolean;
}

export interface ProjectListResponse {
  projects: ProjectWithStack[];
  total: number;
  page: number;
  per_page: number;
}

// UI Helper types
export interface ContributorsByRole {
  maintainers: Contributor[];
  core_contributors: Contributor[];
  contributors: Contributor[];
  founders: Contributor[];
}

export interface SponsorsByTier {
  diamond: Sponsor[];
  platinum: Sponsor[];
  gold: Sponsor[];
  silver: Sponsor[];
  bronze: Sponsor[];
} 