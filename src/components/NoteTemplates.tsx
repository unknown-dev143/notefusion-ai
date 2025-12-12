import React from 'react';
import { Card, Typography, Space, List, Tag } from 'antd';
import { FileTextOutlined, BulbOutlined, BookOutlined, CalendarOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  content: string;
  category: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: <CalendarOutlined />,
    content: `# Meeting Notes

**Date:** [Date]
**Attendees:** [List attendees]
**Location:** [Location/Platform]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Points
- [Key discussion point 1]
- [Key discussion point 2]

## Action Items
- [ ] [Action item 1] - [Assigned to] - [Due date]
- [ ] [Action item 2] - [Assigned to] - [Due date]

## Next Steps
[Next steps or follow-up actions]`,
    category: 'Work',
    tags: ['meeting', 'work', 'notes']
  },
  {
    id: 'todo',
    name: 'To-Do List',
    icon: <FileTextOutlined />,
    content: `# To-Do List

## High Priority
- [ ] [Task 1] - [Due date]
- [ ] [Task 2] - [Due date]

## Medium Priority
- [ ] [Task 3] - [Due date]
- [ ] [Task 4] - [Due date]

## Low Priority
- [ ] [Task 5] - [Due date]

## Notes
[Additional notes or reminders]`,
    category: 'Personal',
    tags: ['todo', 'tasks', 'productivity']
  },
  {
    id: 'project',
    name: 'Project Plan',
    icon: <BulbOutlined />,
    content: `# Project Plan

## Project Overview
**Project Name:** [Project name]
**Start Date:** [Start date]
**Target Completion:** [Target date]

## Objectives
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## Key Milestones
- [Milestone 1] - [Date]
- [Milestone 2] - [Date]
- [Milestone 3] - [Date]

## Resources Needed
- [Resource 1]
- [Resource 2]
- [Resource 3]

## Risks and Mitigation
**Risk:** [Potential risk]
**Mitigation:** [How to address it]

## Timeline
[Detailed timeline or Gantt chart]`,
    category: 'Work',
    tags: ['project', 'planning', 'work']
  },
  {
    id: 'study',
    name: 'Study Notes',
    icon: <BookOutlined />,
    content: `# Study Notes

**Subject:** [Subject name]
**Topic:** [Topic]
**Date:** [Date]

## Key Concepts
- [Concept 1]: [Definition/explanation]
- [Concept 2]: [Definition/explanation]
- [Concept 3]: [Definition/explanation]

## Important Formulas/Definitions
\`[Formula or definition 1]\`
\`[Formula or definition 2]\`

## Examples
**Example 1:**
[Problem statement]
[Solution]

**Example 2:**
[Problem statement]
[Solution]

## Questions to Review
- [Question 1]
- [Question 2]
- [Question 3]

## Summary
[Brief summary of the topic]`,
    category: 'Education',
    tags: ['study', 'education', 'learning']
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    icon: <FileTextOutlined />,
    content: `# Daily Journal

**Date:** [Date]
**Weather:** [Weather]
**Mood:** [Mood]

## Today's Highlights
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]

## What I'm Grateful For
1. [Gratitude 1]
2. [Gratitude 2]
3. [Gratitude 3]

## Challenges Faced
[Describe any challenges and how you handled them]

## What I Learned
[New things learned today]

## Tomorrow's Goals
- [Goal 1]
- [Goal 2]
- [Goal 3]

## Reflections
[Personal reflections and thoughts]`,
    category: 'Personal',
    tags: ['journal', 'personal', 'reflection']
  }
];

interface NoteTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

const NoteTemplates: React.FC<NoteTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <Card title="Note Templates" style={{ marginTop: 16 }}>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={templates}
        renderItem={(template) => (
          <List.Item>
            <Card
              size="small"
              hoverable
              onClick={() => onSelectTemplate(template)}
              style={{ cursor: 'pointer' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {template.icon}
                  <Text strong>{template.name}</Text>
                </Space>
                <div>
                  <Tag color="blue">{template.category}</Tag>
                </div>
                <div>
                  {template.tags.map(tag => (
                    <Tag key={tag} style={{ fontSize: '11px', marginBottom: '2px' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default NoteTemplates;
