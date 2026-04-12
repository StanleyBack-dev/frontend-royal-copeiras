export default function Settings() {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <SettingRow
        label="Notificações"
        description="Receber notificações por e-mail"
        checked={checked}
        onChange={() => setChecked((v) => !v)}
      />
      {/* Outras configurações... */}
    </>
  );
}
