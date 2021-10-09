export interface Compo {
  id: number;
  title: string;
  description: string | null;
  state: string;
  state_name: string;
  public: boolean;
  accept_entries: boolean;
  voting_open: boolean;
  results_public: boolean;
}