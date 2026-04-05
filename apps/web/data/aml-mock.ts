export interface BioDetail {
  label: string;
  value: string;
}

export interface ListedInItem {
  country_code: string;
  label: string;
  source: string;
}

export interface DocumentItem {
  name: string;
  type: string;
  size: string;
}

export interface Bio {
  name: string;
  details: BioDetail[];
  listed_in: ListedInItem[];
  documents: DocumentItem[];
}

export const bio: Bio = {
  name: 'Ahmad Hidayat',
  details: [
    {
      label: 'Gender',
      value: 'Male',
    },
    {
      label: 'Born',
      value: 'June 28, 1977, Serawak, Malaysia',
    },
    {
      label: 'Alias',
      value: 'Taufik, Dayat, Ahmad Taufik',
    },
    {
      label: 'Nationality',
      value: 'Malaysia',
    },
    {
      label: 'Last Seen',
      value: 'Brunei Darussalam',
    },
  ],
  listed_in: [
    {
      country_code: 'in',
      label: 'Indonesia',
      source: 'https://google.com',
    },
    {
      country_code: 'cn',
      label: 'China',
      source: 'https://google.com',
    },
    {
      country_code: 'un',
      label: 'UN Consolidated List',
      source: 'https://google.com',
    },
    {
      country_code: 'eu',
      label: 'EEAS Sanction List',
      source: 'https://google.com',
    },
  ],
  documents: [
    {
      name: 'Arrest Warrant',
      type: 'PDF',
      size: '2.3 MB',
    },
    {
      name: 'Westing Order',
      type: 'PDF',
      size: '2.3 MB',
    },
  ],
};
