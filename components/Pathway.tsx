'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { chatSession } from '@/models/AiModel';
import axios from 'axios';

const PathwayComponent = ({ userId }: { userId: any }) => {
  const [loading, setLoading] = useState(false);
  const [pathway, setPathway] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user results
  const fetchUserResults = async () => {
    try {
      const response = axios.get(`/api/getResult`,userId);
      
      console.log(response);
      
      
    } catch (err) {
      console.error('Failed to fetch user results:', err);
      throw new Error('Could not load user results.');
    }
  };

  // Generate personalized pathway
  const generatePathway = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchUserResults();
      
      const prompt = `
        Based on these quiz results: ${JSON.stringify(results)}, create a personalized learning pathway. 
        Focus on improving weak areas while building on strengths. Include detailed steps and topics to study, and suggest resources.
      `;

      const response = await chatSession.sendMessage(prompt);
      const pathwayContent = await response.response.text();

      setPathway(pathwayContent);
    } catch (err) {
      console.error('Error generating pathway:', err);
      setError('Failed to generate learning pathway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h1 className="text-xl font-bold mb-4">Your Personalized Learning Pathway</h1>
      {error && <p className="text-red-600">{error}</p>}

      {!pathway && !loading && (
        <Button onClick={generatePathway}>
          Generate Pathway
        </Button>
      )}

      {loading && (
        <div className="flex items-center">
          <Loader2 className="mr-2 animate-spin" />
          <span>Generating your pathway...</span>
        </div>
      )}

      {pathway && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Generated Pathway:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg">{pathway}</pre>
        </div>
      )}
    </div>
  );
};

export default PathwayComponent;
