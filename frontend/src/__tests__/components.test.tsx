/*
Frontend component tests for React components.
Run with: npm test
*/

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SalaryExpectations from '../components/panels/SalaryExpectations';
import ResumeImprovement from '../components/panels/ResumeImprovement';
import * as resumeApi from '../api/resumeApi';

// Mock the API module
vi.mock('../api/resumeApi');

describe('SalaryExpectations Component', () => {
  const mockResumeText = 'Senior Software Engineer with 5 years experience.';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders salary expectations component', () => {
    render(<SalaryExpectations resumeText={mockResumeText} />);
    expect(screen.getByText('Salary Expectations')).toBeInTheDocument();
  });

  it('displays input fields for job details', () => {
    render(<SalaryExpectations resumeText={mockResumeText} />);
    expect(screen.getByPlaceholderText('e.g., Senior Engineer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 5')).toBeInTheDocument();
  });

  it('calls API when button is clicked', async () => {
    resumeApi.getSalaryExpectations.mockResolvedValue({
      salary_guidance: 'Entry-level: $100K-$150K'
    });

    render(<SalaryExpectations resumeText={mockResumeText} />);
    const button = screen.getByText('Get Salary Expectations');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(resumeApi.getSalaryExpectations).toHaveBeenCalledWith(
        mockResumeText,
        undefined,
        undefined,
        undefined
      );
    });
  });

  it('displays results when API succeeds', async () => {
    resumeApi.getSalaryExpectations.mockResolvedValue({
      salary_guidance: 'Entry-level: $100K-$150K\nMid-level: $150K-$200K'
    });

    render(<SalaryExpectations resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Salary Expectations'));

    await waitFor(() => {
      expect(screen.getByText(/Entry-level: \$100K-\$150K/)).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    resumeApi.getSalaryExpectations.mockRejectedValue(
      new Error('API Error')
    );

    render(<SalaryExpectations resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Salary Expectations'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', async () => {
    resumeApi.getSalaryExpectations.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<SalaryExpectations resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Salary Expectations'));

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('passes correct job details to API', async () => {
    resumeApi.getSalaryExpectations.mockResolvedValue({
      salary_guidance: 'Result'
    });

    const { rerender } = render(
      <SalaryExpectations
        resumeText={mockResumeText}
        jobTitle="Senior Engineer"
        experienceYears={5}
        location="San Francisco"
      />
    );

    const button = screen.getByText('Get Salary Expectations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(resumeApi.getSalaryExpectations).toHaveBeenCalledWith(
        mockResumeText,
        'Senior Engineer',
        5,
        'San Francisco'
      );
    });
  });
});

describe('ResumeImprovement Component', () => {
  const mockResumeText = 'Senior Software Engineer with 5 years experience.';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders resume improvement component', () => {
    render(<ResumeImprovement resumeText={mockResumeText} />);
    expect(screen.getByText('Resume Improvements')).toBeInTheDocument();
  });

  it('displays focus area input', () => {
    render(<ResumeImprovement resumeText={mockResumeText} />);
    expect(screen.getByPlaceholderText(/Focus Area/i)).toBeInTheDocument();
  });

  it('calls API when button is clicked', async () => {
    resumeApi.improveResume.mockResolvedValue({
      improvements: '1. Add metrics\n2. Use action verbs'
    });

    render(<ResumeImprovement resumeText={mockResumeText} />);
    const button = screen.getByText('Get Improvements');
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(resumeApi.improveResume).toHaveBeenCalledWith(mockResumeText, undefined);
    });
  });

  it('displays improvements in expandable items', async () => {
    resumeApi.improveResume.mockResolvedValue({
      improvements: '1. Add metrics\n2. Use action verbs'
    });

    render(<ResumeImprovement resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Improvements'));

    await waitFor(() => {
      expect(screen.getByText(/1 Improvement/)).toBeInTheDocument();
    });
  });

  it('expands and collapses improvement items', async () => {
    resumeApi.improveResume.mockResolvedValue({
      improvements: '1. Add metrics to achievements\n2. Use stronger action verbs'
    });

    render(<ResumeImprovement resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Improvements'));

    await waitFor(() => {
      const expandButtons = screen.getAllByRole('button');
      fireEvent.click(expandButtons[0]);
      // Check that expanded content appears
    });
  });

  it('shows loading state while fetching', async () => {
    resumeApi.improveResume.mockImplementation(
      () => new Promise(() => {})
    );

    render(<ResumeImprovement resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Improvements'));

    expect(screen.getByText('Analyzing Resume...')).toBeInTheDocument();
  });

  it('shows error on failure', async () => {
    resumeApi.improveResume.mockRejectedValue(
      new Error('Failed to get improvements')
    );

    render(<ResumeImprovement resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Improvements'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('accepts focus area parameter', async () => {
    resumeApi.improveResume.mockResolvedValue({
      improvements: '1. Focus area specific improvement'
    });

    render(<ResumeImprovement resumeText={mockResumeText} focusArea="Skills" />);
    fireEvent.click(screen.getByText('Get Improvements'));

    await waitFor(() => {
      expect(resumeApi.improveResume).toHaveBeenCalledWith(mockResumeText, 'Skills');
    });
  });

  it('displays count of improvements found', async () => {
    resumeApi.improveResume.mockResolvedValue({
      improvements: '1. First\n2. Second\n3. Third\n4. Fourth\n5. Fifth'
    });

    render(<ResumeImprovement resumeText={mockResumeText} />);
    fireEvent.click(screen.getByText('Get Improvements'));

    await waitFor(() => {
      expect(screen.getByText(/5 Improvements Found/)).toBeInTheDocument();
    });
  });
});

export {};
