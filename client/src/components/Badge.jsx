// Coloured label: red = Lost, green = Found, grey = Claimed, plus claim statuses
const styles = {
  lost: 'bg-red-100 text-red-700',
  found: 'bg-green-100 text-green-700',
  claimed: 'bg-gray-200 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Badge({ value }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[value] || 'bg-gray-100'}`}>
      {value}
    </span>
  );
}

// An item shows "Claimed" once claimed, otherwise its type (Lost / Found)
export function ItemBadge({ item }) {
  return <Badge value={item.status === 'claimed' ? 'claimed' : item.type} />;
}
