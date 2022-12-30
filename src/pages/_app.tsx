import { Anchor, Center, MantineProvider } from '@mantine/core';
import { type AppType } from 'next/app';

import { trpc } from '../utils/trpc';

const github = 'https://github.com/ickynavigator/github-book';
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Component {...pageProps} />

      <Center>
        <Anchor href={github} target="_blank">
          SOURCE CODE
        </Anchor>
      </Center>
    </MantineProvider>
  );
};

export default trpc.withTRPC(MyApp);
