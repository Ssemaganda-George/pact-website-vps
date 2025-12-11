import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRoute } from 'wouter';
import { MapPin, Mail, Linkedin, ChevronLeft, ArrowRight } from 'lucide-react';

// Define the TeamMember interface to match the API response
interface TeamMember {
  id: number;
  name: string;
  position?: string;
  department?: string;
  location?: string;
  bio: string;
  expertise: string[];
  image: string | null;
  slug: string;
  metaDescription: string | null;
  email?: string;
  linkedin: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cache interfaces
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache for team members data to prevent redundant API calls
const teamMemberCache: Record<string, CacheEntry<TeamMember>> = {};
let allTeamMembersCache: CacheEntry<TeamMember[]> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const TeamMemberDetail = () => {
  const [, params] = useRoute('/team/:slug');
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedMembers, setRelatedMembers] = useState<TeamMember[]>([]);



  useEffect(() => {
    const fetchTeamMember = async () => {
      if (!params || !params.slug) {
        setError("No slug provided");
        setIsLoading(false);
        return;
      }

      // Create AbortController for cleanup
      const controller = new AbortController();
      const signal = controller.signal;

      try {
        setIsLoading(true);

        // Check cache first for this team member
        const now = Date.now();
        const cachedMember = teamMemberCache[params.slug];
        if (cachedMember && (now - cachedMember.timestamp < CACHE_DURATION)) {
          setMember(cachedMember.data);

          // Get related members from cache if available
          if (allTeamMembersCache && (now - allTeamMembersCache.timestamp < CACHE_DURATION)) {
            const related = allTeamMembersCache.data
              .filter((m: TeamMember) =>
                m.department === cachedMember.data.department &&
                m.id !== cachedMember.data.id
              )
              .slice(0, 3);

            setRelatedMembers(related);
            setIsLoading(false);
            return;
          }
        } else {
          // Fetch the team member detail
          const response = await fetch(`/api/team/${params.slug}`, { signal });

          if (!response.ok) {
            throw new Error(`Failed to fetch team member: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          if (data.success && data.data) {
            // Update cache
            teamMemberCache[params.slug] = {
              data: data.data,
              timestamp: now
            };

            setMember(data.data);
          } else {
            throw new Error(data.message || "Failed to fetch team member");
          }
        }

        // Check cache for all team members
        if (allTeamMembersCache && (now - allTeamMembersCache.timestamp < CACHE_DURATION)) {
          const related = allTeamMembersCache.data
            .filter((m: TeamMember) =>
              m.department === (member?.department || teamMemberCache[params.slug]?.data.department) &&
              m.id !== (member?.id || teamMemberCache[params.slug]?.data.id)
            )
            .slice(0, 3);

          setRelatedMembers(related);
        } else {
          // Fetch all team members to find related ones
          const allMembersResponse = await fetch(`/api/team`, { signal });

          if (allMembersResponse.ok) {
            const allMembersData = await allMembersResponse.json();

            if (allMembersData.success && Array.isArray(allMembersData.data)) {
              // Update cache
              allTeamMembersCache = {
                data: allMembersData.data,
                timestamp: now
              };

              // Find related members with same department
              const currentMember = member || teamMemberCache[params.slug]?.data;

              if (currentMember) {
                const related = allMembersData.data
                  .filter((m: TeamMember) =>
                    m.department === currentMember.department &&
                    m.id !== currentMember.id
                  )
                  .slice(0, 3);

                setRelatedMembers(related);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        setIsLoading(false);
      }

      return () => {
        // Cleanup function to abort fetch requests when component unmounts
        controller.abort();
      };
    };

    fetchTeamMember();

    // Scroll to top
    window.scrollTo(0, 0);

    // Add a specific dependency: only re-run when the slug or baseUrl changes
  }, [params?.slug]);

  // Function to get initials from name
  const getInitials = useCallback((name: string) => {
    return name?.split(' ').map(n => n[0]).join('') || '';
  }, []);

  // Function to properly format image paths
  const getImagePath = useCallback((imagePath: string | null) => {
    if (!imagePath) return undefined;
    // All images are now full Supabase Storage URLs
    return imagePath;
  }, []);

  // Memoize the link handlers to prevent re-renders
  const handleTeamLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = "/team";
  }, []);

  const handleProfileLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    window.location.href = `/team/${slug}`;
  }, []);

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 flex justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="pt-32 pb-24 text-center">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-bold text-dark mb-6">Team Member Not Found</h1>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            We couldn't find the team member you're looking for. They may have moved to a different position or left the company.
          </p>
          <a
            href="/team"
            onClick={handleTeamLinkClick}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Team
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Breadcrumbs */}
      <nav className="bg-gray-100 py-3 mb-0 border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center text-sm">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "/";
              }}
              className="text-gray-500 hover:text-primary"
            >
              Home
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <a
              href="/team"
              onClick={handleTeamLinkClick}
              className="text-gray-500 hover:text-primary"
            >
              Team
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-primary">{member.name}</span>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="container mx-auto px-4 md:px-8 py-12">
          <div className="lg:flex gap-12 items-start">
            {/* Profile Image Column */}
            <div className="lg:w-1/3 mb-8 lg:mb-0">
              <div className="rounded-lg overflow-hidden shadow-md bg-primary/10">
                {member.image ? (
                  <img
                    src={getImagePath(member.image)}
                    alt={member.name}
                    className="w-full h-full object-cover aspect-[3/4]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center aspect-[3/4]';
                        fallback.innerHTML = `<div class="text-6xl font-bold text-primary">${getInitials(member.name)}</div>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-primary/10">
                    <div className="text-6xl font-bold text-primary">
                      {getInitials(member.name)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info Column */}
            <div className="lg:w-2/3">
              <div className="flex flex-wrap items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-2">{member.name}</h1>
                  {member.position && (
                    <p className="text-xl text-accent mb-4">{member.position}</p>
                  )}
                </div>
              </div>

              {/* Location and Department */}
              {(member.location || member.department) && (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 text-gray-600 mb-6">
                  {member.location && (
                    <div className="flex items-center mb-2 md:mb-0">
                      <MapPin className="w-5 h-5 mr-2 text-accent" />
                      <span>{member.location}</span>
                    </div>
                  )}
                  {member.department && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Department:</span>
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {(member.email || member.linkedin) && (
                <div className="flex space-x-4 mb-8">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="px-6 py-3 bg-primary text-white rounded-md flex items-center hover:bg-primary-hover transition-colors"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      <span>Send Email</span>
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-accent text-white rounded-md flex items-center hover:bg-accent/80 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 mr-2" />
                      <span>Connect on LinkedIn</span>
                    </a>
                  )}
                </div>
              )}

              {/* Bio */}
              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: member.bio }}></p>
              </div>

              {/* Expertise Tags */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Team Members */}
      {relatedMembers.length > 0 && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-primary">
                More {member.department} Team Members
              </h2>

              <a
                href="/team"
                onClick={handleTeamLinkClick}
                className="text-primary hover:text-accent font-medium flex items-center"
              >
                <span>View All Team Members</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedMembers.map(relatedMember => (
                <div
                  key={relatedMember.id}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[3/4] overflow-hidden relative bg-primary/10">
                    {relatedMember.image ? (
                      <img
                        src={getImagePath(relatedMember.image)}
                        alt={relatedMember.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex items-center justify-center';
                            fallback.innerHTML = `<div class="text-4xl font-bold text-primary">${getInitials(relatedMember.name)}</div>`;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl font-bold text-primary">
                          {getInitials(relatedMember.name)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-1">{relatedMember.name}</h3>
                    <p className="text-accent mb-2">{relatedMember.position}</p>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{relatedMember.location}</span>
                    </div>

                    <a
                      href={`/team/${relatedMember.slug}`}
                      onClick={(e) => handleProfileLinkClick(e, relatedMember.slug)}
                      className="text-primary hover:text-accent font-medium flex items-center"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberDetail;