import '@styles/_check-true-false.scss';

import { DeleteAccount } from '@components/settings/DeleteAccount';
import { ModifyData } from '@components/settings/ModifyData';
import { ModifyEmail } from '@components/settings/ModifyEmail';
import { ModifyPassword } from '@components/settings/ModifyPassword';
import { TwoFactorSettings } from '@components/TwoFactorSettings';
import { useLoaderData, useRevalidator } from 'react-router-dom';

export function Settings() {
  const user = useLoaderData();
  const revalidator = useRevalidator();

  return (
    <>
      <div className="settings__section">
        <ModifyData user={user} onUpdate={() => revalidator.revalidate()} />
        <ModifyEmail user={user} onUpdate={() => revalidator.revalidate()} />
        <ModifyPassword user={user} />
        <TwoFactorSettings active={user.active_2fa} />
        <DeleteAccount user={user} />
      </div>
    </>
  );
}
