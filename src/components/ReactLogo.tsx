import reactLogo from '../logo.svg?url';

export const ReactLogo = () => {
  return (
    <img
      src={reactLogo}
      alt="React logo"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '130px',
      }}
    />
  );
};
