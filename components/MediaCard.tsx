export default function MediaCard({
  href,
  imgSrc,
  title,
  meta,
}: {
  href: string;
  imgSrc: string;
  title: string;
  meta?: string;
}) {
  return (
    <a className="card" href={href}>
      <img src={imgSrc} alt={title} loading="lazy" />
      <div className="card-body">
        <div className="card-title">{title}</div>
        {meta && <div className="card-meta">{meta}</div>}
      </div>
    </a>
  );
}
