export default function Header({ heading, paragraph, linkName, linkUrl }) {
  return (
    <div className="text-center">
      {/* 🔥 Removed the small logo/image from here */}

      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{heading}</h2>

      {paragraph && linkName && (
        <p className="mt-2 text-sm text-gray-600">
          {paragraph}{" "}
          <a
            href={linkUrl}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {linkName}
          </a>
        </p>
      )}
    </div>
  );
}
