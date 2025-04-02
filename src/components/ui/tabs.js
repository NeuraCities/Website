import * as React from "react";

// Tabs context
const TabsContext = React.createContext(null);

// Tabs component
const Tabs = ({ defaultValue, value, onValueChange, children, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  const currentValue = value !== undefined ? value : activeTab;
  
  const changeTab = React.useCallback(
    (value) => {
      if (onValueChange) {
        onValueChange(value);
      } else {
        setActiveTab(value);
      }
    },
    [onValueChange]
  );
  
  return (
    <TabsContext.Provider value={{ value: currentValue, changeTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList component
const TabsList = ({ children, className = "" }) => {
  return (
    <div className={className} role="tablist">
      {children}
    </div>
  );
};

// TabsTrigger component
const TabsTrigger = ({ value, children, className = "", disabled = false }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  
  const isActive = context.value === value;
  
  const handleClick = () => {
    if (!disabled) {
      context.changeTab(value);
    }
  };
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// TabsContent component
const TabsContent = ({ value, children, className = "" }) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }
  
  const isActive = context.value === value;
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      className={className}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };