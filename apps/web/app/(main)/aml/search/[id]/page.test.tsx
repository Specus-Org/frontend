import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScreeningEntity } from '@specus/api-client';
import AMLEntityDetailPage from './page';

const { push, getScreeningEntity, biographySpy, listedSpy } = vi.hoisted(() => ({
  push: vi.fn(),
  getScreeningEntity: vi.fn(),
  biographySpy: vi.fn(),
  listedSpy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'entity-1' }),
  useRouter: () => ({ push }),
}));

vi.mock('@specus/api-client', () => ({
  getScreeningEntity,
}));

vi.mock('@specus/ui/components/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/aml/search-result-header', () => ({
  SearchResultHeader: ({ entity }: { entity: ScreeningEntity }) => <div>{entity.caption}</div>,
}));

vi.mock('@/components/aml/biography-section', () => ({
  BiographySection: (props: unknown) => {
    biographySpy(props);
    return <div data-testid="biography-section" />;
  },
}));

vi.mock('@/components/aml/listed-in-section', () => ({
  ListedInSection: (props: unknown) => {
    listedSpy(props);
    return <div data-testid="listed-section" />;
  },
}));

describe('AMLEntityDetailPage', () => {
  beforeEach(() => {
    push.mockReset();
    getScreeningEntity.mockReset();
    biographySpy.mockReset();
    listedSpy.mockReset();
  });

  it('passes type fields and sanctions into the updated detail sections', async () => {
    getScreeningEntity.mockResolvedValue({
      data: {
        id: 'entity-1',
        caption: 'Specus Vendor',
        entity_type: 'organization',
        names: [],
        sanctions: [
          {
            event_type: 'sanction',
            is_active: true,
            program: 'OFAC SDN',
          },
        ],
        type_fields: {
          registration_number: '123',
        },
      },
    });

    render(<AMLEntityDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Specus Vendor')).toBeInTheDocument();
    });

    expect(biographySpy).toHaveBeenCalledWith({
      entityType: 'organization',
      typeFields: {
        registration_number: '123',
      },
    });

    expect(listedSpy).toHaveBeenCalledWith({
      items: [
        {
          event_type: 'sanction',
          is_active: true,
          program: 'OFAC SDN',
        },
      ],
    });
  });

  it('renders the existing error state when the detail fetch fails', async () => {
    getScreeningEntity.mockRejectedValue(new Error('boom'));

    render(<AMLEntityDetailPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load entity details\. please try again\./i),
      ).toBeInTheDocument();
    });
  });
});
