import type { AssessmentHistory, KnowledgeGap, RoadmapMilestone } from '@/types';

export const aiService = {
  analyzeHistory: (history: AssessmentHistory[]) => {
    const knowledgeGaps: KnowledgeGap[] = [];
    const roadmap: RoadmapMilestone[] = [];

    // 1. Identify Strengths (score >= 75)
    const strengths = history.filter(h => h.score >= 75);
    strengths.forEach(s => {
      knowledgeGaps.push({
        concept: `${s.topicName} Core Concepts`,
        status: 'strength',
        description: `Excellent understanding of ${s.topicName} with a score of ${s.score}%.`,
        suggestedResources: [`Official ${s.topicName} documentation`, `Advanced ${s.topicName} patterns`],
      });
    });

    // 2. Identify Weak Areas (score < 60)
    const weakAreas = history.filter(h => h.score < 60);
    weakAreas.forEach(w => {
      knowledgeGaps.push({
        concept: `${w.topicName} Fundamentals`,
        status: 'weak',
        description: `Your score of ${w.score}% indicates some gaps in ${w.topicName}.`,
        suggestedResources: [`Beginner's guide to ${w.topicName}`, `${w.topicName} practice exercises`],
      });
    });

    // 3. Identify Missing Concepts (score 60 to 74, or general advanced topics)
    const moderateAreas = history.filter(h => h.score >= 60 && h.score < 75);
    moderateAreas.forEach(m => {
      knowledgeGaps.push({
        concept: `Advanced ${m.topicName}`,
        status: 'missing',
        description: `You understand the basics of ${m.topicName} (${m.score}%), but need to learn advanced concepts.`,
        suggestedResources: [`Deep dive into ${m.topicName}`, `Scalable architectures using ${m.topicName}`],
      });
    });

    // Fallback: If no gaps exist, create a default set so the UI is never blank
    if (knowledgeGaps.length === 0) {
      knowledgeGaps.push({
        concept: 'Introductory Concepts',
        status: 'strength',
        description: 'You have started your learning journey successfully.',
        suggestedResources: ['General overview of computer science fundamentals'],
      });
    }

    // 4. Generate Roadmap: create milestones based on weak & missing concepts
    const reviewNeeded = [...weakAreas, ...moderateAreas];
    
    if (reviewNeeded.length > 0) {
      reviewNeeded.forEach((item, index) => {
        roadmap.push({
          week: index + 1,
          title: item.score < 60 ? `Mastering ${item.topicName}` : `Deepening ${item.topicName}`,
          description: item.score < 60 
            ? `Reinforce fundamentals and fill critical gaps in ${item.topicName}.`
            : `Explore advanced subtopics, patterns, and optimizations in ${item.topicName}.`,
          topics: [item.topicName],
          status: index === 0 ? 'in_progress' : 'locked',
          resources: item.score < 60 
            ? [`Basic ${item.topicName} handbook`, 'Codecademy practice']
            : [`Advanced ${item.topicName} video series`, 'GitHub examples'],
        });
      });
    } else {
      // If user passed everything perfectly, offer an enrichment roadmap
      roadmap.push({
        week: 1,
        title: 'System Design & Architecture',
        description: 'Since you have mastered the basics, transition into large-scale system architecture.',
        topics: ['Design Patterns', 'Microservices', 'Web Security'],
        status: 'in_progress',
        resources: ['Designing Data-Intensive Applications', 'System Design Primer'],
      });
    }

    return { knowledgeGaps, roadmap };
  }
};
