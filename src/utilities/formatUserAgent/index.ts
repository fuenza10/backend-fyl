export const formattedUserAgent = (userAgent) => {
  if (userAgent.includes('Mozilla')) {
    let os = userAgent.split('(')[1].split(';')[0];
    let browser = '';
    let version = '';
    if (userAgent.includes('Android')) {
      os = userAgent.split('(')[1].split(')')[0];
      browser = userAgent.split(')')[2].split('/')[0];
      version = userAgent.split('/')[2].split(' ')[0];
    } else if (userAgent.includes('iPhone')) {
      os = userAgent.split('(')[1].split(')')[0];
      browser =
        userAgent.split(')')[2].split('/')[0] === ' CriOS'
          ? 'Chrome'
          : 'Safari';
      version = userAgent.split('/')[3].split(' ')[0];
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
      version = userAgent.split('/')[5].split(' ')[0];
    } else if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      version = userAgent.split('/')[3].split(' ')[0];
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      version = userAgent.split('/')[2].split(' ')[0];
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      version = userAgent.split('/')[1].split(' ')[0];
    }

    return `${os} / ${browser}/${version}`;
  }
  return userAgent;
};
export const formatUserAgent = (userAgent: string) => {
  if (userAgent.includes('iPhone')) {
    const os = userAgent.match(/\(([^)]+)\)/)[1];
    const browser = userAgent.includes('CriOS') ? 'Chrome' : 'Safari';
    const version = userAgent.match(/Version\/([\d.]+)/)[1];
    return `${os} / ${browser}/${version}`;
  }
  if (userAgent.includes('Android')) {
    const os = userAgent.match(/\(([^)]+)\)/)[1];
    const browser = userAgent.split(')')[2].split('/')[0];
    const version = userAgent.split('/')[2].split(' ')[0];
    return `${os} / ${browser}/${version}`;
  }
  if (userAgent.includes('Edg')) {
    const version = userAgent.match(/Edg\/([\d.]+)/)[1];
    return `Windows / Edge/${version}`;
  }
  if (userAgent.includes('Chrome')) {
    const version = userAgent.match(/Chrome\/([\d.]+)/)[1];
    return `Windows / Chrome/${version}`;
  }
  if (userAgent.includes('Safari')) {
    const version = userAgent.match(/Version\/([\d.]+)/)[1];
    return `Macintosh / Safari/${version}`;
  }
  if (userAgent.includes('Firefox')) {
    const version = userAgent.match(/Firefox\/([\d.]+)/)[1];
    return `Windows / Firefox/${version}`;
  }
  return userAgent;
};
