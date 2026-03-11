import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/auth';
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login');
  }

  return <SettingsContent currentUser={currentUser} />;
}
