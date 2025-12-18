/**
 * EmptyState Component
 * Welcome screen for new chats
 */

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      {/* Welcome Text */}
      <h1 className="text-[27px] font-semibold text-[#000000] font-open-sans">
        Let's get started...
      </h1>
    </div>
  );
};

export default EmptyState;
