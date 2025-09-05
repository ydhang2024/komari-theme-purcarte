import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed inset-shadow-sm bottom-0 left-0 right-0 p-2 text-center purcarte-blur z-50">
      <p className="flex justify-center text-sm text-second-foreground text-shadow-lg whitespace-pre">
        Powered by{" "}
        <a
          href="https://github.com/komari-monitor/komari"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          Komari Monitor
        </a>
        {" | "}
        Theme by{" "}
        <a
          href="https://github.com/ydhang2024/komari-theme-purcarte"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 transition-colors">
          Hang
        </a>
      </p>
    </footer>
  );
};

export default Footer;
