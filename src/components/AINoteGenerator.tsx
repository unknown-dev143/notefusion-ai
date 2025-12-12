import React, { useState } from 'react';
import { Card, Typography, Button, Space, Select, Input, message } from 'antd';
import { RobotOutlined, BulbOutlined, BookOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GenerationOptions {
  topic: string;
  type: 'summary' | 'outline' | 'detailed' | 'flashcards' | 'quiz';
  tone: 'formal' | 'casual' | 'academic' | 'creative';
  length: 'short' | 'medium' | 'long';
  complexity: 'basic' | 'intermediate' | 'advanced';
}

const AINoteGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    topic: '',
    type: 'summary',
    tone: 'casual',
    length: 'medium',
    complexity: 'intermediate'
  });
  const [generatedContent, setGeneratedContent] = useState('');

  const generateNote = async () => {
    if (!options.topic.trim()) {
      message.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let content = '';
      
      switch (options.type) {
        case 'summary':
          content = generateSummary(options.topic, options.length, options.complexity);
          break;
        case 'outline':
          content = generateOutline(options.topic, options.length, options.complexity);
          break;
        case 'detailed':
          content = generateDetailed(options.topic, options.length, options.complexity, options.tone);
          break;
        case 'flashcards':
          content = generateFlashcards(options.topic, options.length, options.complexity);
          break;
        case 'quiz':
          content = generateQuiz(options.topic, options.length, options.complexity);
          break;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
      message.success('Note generated successfully!');
    }, 2000);
  };

  const generateSummary = (topic: string, length: string, complexity: string) => {
    const complexityMap = { basic: 'simple', intermediate: 'moderate', advanced: 'complex' };
    
    return `# ${topic} - Summary

## Overview
This is a ${complexityMap[complexity as keyof typeof complexityMap]} summary of ${topic}. 
The content covers the key concepts and important information you need to understand.

## Key Points
- First important aspect of ${topic}
- Second critical concept related to ${topic}
- Third essential element to remember
- Additional relevant information

## Conclusion
${topic} is an important subject that requires understanding of these fundamental concepts.
This ${length} summary provides the essential information for further study.`;
  };

  const generateOutline = (topic: string, _length: string, _complexity: string) => {
    return `# ${topic} - Outline

## I. Introduction
   A. Definition of ${topic}
   B. Importance and relevance
   C. Scope of the topic

## II. Main Concepts
   A. Core Principle 1
      1. Explanation
      2. Examples
   B. Core Principle 2
      1. Applications
      2. Benefits
   C. Core Principle 3
      1. Challenges
      2. Solutions

## III. Advanced Topics
   A. Complex Concept 1
   B. Complex Concept 2
   C. Future developments

## IV. Practical Applications
   A. Real-world examples
   B. Case studies
   C. Best practices

## V. Conclusion
   A. Summary of key points
   B. Future considerations
   C. Resources for further learning`;
  };

  const generateDetailed = (topic: string, _length: string, _complexity: string, tone: string) => {
    const toneMap = { 
      formal: 'This comprehensive analysis', 
      casual: 'Let\'s dive into', 
      academic: 'This scholarly examination', 
      creative: 'Explore the fascinating world of' 
    };
    
    return `# ${topic} - Detailed Guide

## Introduction
${toneMap[tone as keyof typeof toneMap]} ${topic}, a subject of significant importance in today's context.

## Background and Context
${topic} has evolved over time through various developments and innovations. 
Understanding its historical context helps us appreciate its current significance.

## Core Concepts

### Fundamental Principles
The basic principles of ${topic} include several key elements that form its foundation:

1. **Principle One**: This aspect deals with...
2. **Principle Two**: Another critical component involves...
3. **Principle Three**: The third essential element focuses on...

### Advanced Concepts
For those seeking deeper understanding:

- **Complex Concept A**: Detailed explanation...
- **Complex Concept B**: In-depth analysis...
- **Complex Concept C**: Advanced applications...

## Practical Applications
${topic} finds applications in various domains:

- **Application 1**: How it's used in practice
- **Application 2**: Real-world examples
- **Application 3**: Industry implementations

## Conclusion
This detailed exploration of ${topic} provides a comprehensive understanding of its various aspects.
The knowledge gained here serves as a foundation for further exploration and practical application.`;
  };

  const generateFlashcards = (topic: string, _length: string, _complexity: string) => {
    return `# ${topic} - Flashcards

## Flashcard Set

**Q: What is ${topic}?**
A: ${topic} is defined as...

**Q: Why is ${topic} important?**
A: ${topic} is significant because...

**Q: What are the main components of ${topic}?**
A: The main components include...

**Q: How does ${topic} work?**
A: ${topic} functions by...

**Q: What are common applications of ${topic}?**
A: Common applications include...

**Q: What are the benefits of ${topic}?**
A: Key benefits are...

**Q: What challenges exist with ${topic}?**
A: Main challenges involve...

**Q: What is the future of ${topic}?**
A: Future developments suggest...

**Q: How can I learn more about ${topic}?**
A: Resources for further learning...

**Q: What are best practices for ${topic}?**
A: Recommended practices include...`;
  };

  const generateQuiz = (topic: string, _length: string, _complexity: string) => {
    return `# ${topic} - Quiz Questions

## Multiple Choice Questions

1. Which of the following best describes ${topic}?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

2. What is the primary purpose of ${topic}?
   a) Purpose A
   b) Purpose B
   c) Purpose C
   d) Purpose D

## Short Answer Questions

3. Explain the importance of ${topic} in today's context.
   
4. Describe the main components of ${topic}.

## True/False Questions

5. ${topic} is always easy to understand. (True/False)

6. ${topic} has no practical applications. (True/False)

## Essay Questions

7. Discuss the evolution and future prospects of ${topic}.

8. Analyze the impact of ${topic} on society and industry.

## Answer Key
1. c) Option C
2. b) Purpose B
5. False
6. False`;
  };

  return (
    <Card title="AI Note Generator" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Topic:</Text>
          <TextArea
            placeholder="Enter the topic you want to generate notes about..."
            value={options.topic}
            onChange={(e) => setOptions({ ...options, topic: e.target.value })}
            rows={2}
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>Note Type:</Text>
          <Select
            value={options.type}
            onChange={(value) => setOptions({ ...options, type: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="summary">
              <Space>
                <BulbOutlined />
                Summary
              </Space>
            </Select.Option>
            <Select.Option value="outline">
              <Space>
                <BookOutlined />
                Outline
              </Space>
            </Select.Option>
            <Select.Option value="detailed">
              <Space>
                <RobotOutlined />
                Detailed Notes
              </Space>
            </Select.Option>
            <Select.Option value="flashcards">
              <Space>
                <ThunderboltOutlined />
                Flashcards
              </Space>
            </Select.Option>
            <Select.Option value="quiz">
              <Space>
                <RobotOutlined />
                Quiz Questions
              </Space>
            </Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>Tone:</Text>
          <Select
            value={options.tone}
            onChange={(value) => setOptions({ ...options, tone: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="formal">Formal</Select.Option>
            <Select.Option value="casual">Casual</Select.Option>
            <Select.Option value="academic">Academic</Select.Option>
            <Select.Option value="creative">Creative</Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>Length:</Text>
          <Select
            value={options.length}
            onChange={(value) => setOptions({ ...options, length: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="short">Short (100-200 words)</Select.Option>
            <Select.Option value="medium">Medium (200-400 words)</Select.Option>
            <Select.Option value="long">Long (400-600 words)</Select.Option>
          </Select>
        </div>

        <div>
          <Text strong>Complexity:</Text>
          <Select
            value={options.complexity}
            onChange={(value) => setOptions({ ...options, complexity: value })}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Select.Option value="basic">Basic</Select.Option>
            <Select.Option value="intermediate">Intermediate</Select.Option>
            <Select.Option value="advanced">Advanced</Select.Option>
          </Select>
        </div>

        <Button 
          type="primary" 
          icon={<RobotOutlined />}
          onClick={generateNote}
          loading={isGenerating}
          size="large"
        >
          {isGenerating ? 'Generating...' : 'Generate Note'}
        </Button>

        {generatedContent && (
          <div>
            <Title level={4}>Generated Content:</Title>
            <div style={{ 
              background: '#f6f8fa', 
              padding: '16px', 
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {generatedContent}
            </div>
            <Button 
              style={{ marginTop: 8 }}
              onClick={() => {
                navigator.clipboard.writeText(generatedContent);
                message.success('Content copied to clipboard!');
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default AINoteGenerator;
