import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler, useDocumentTitle } from '@app/utils';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { BasenameContext } from '@bf2/ui-shared';
import { useHistory } from 'react-router';
import {
  APIManagementPage,
  DataSciencePage,
  KafkaPage,
  KasPage,
  NotFoundPage,
  OverviewPage,
  QuickStartDrawerFederated,
  ResourcesPage,
  ServiceAccountsPage,
  SrsPage,
} from '@app/pages';

let routeFocusTimer: number;

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: undefined;
  federatedComponent?: string;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const RedirectToOverview: React.FunctionComponent = () => <Redirect to="/overview" />;
const RedirectToStreamsKafkas: React.FunctionComponent = () => <Redirect to="/streams/kafkas" />;

const routes: AppRouteConfig[] = [
  {
    component: KafkaPage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/streams/kafkas/:id',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: KafkaPage,
    exact: false,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/streams/kafkas/:id/topics/:topicName',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    // Handle the redirect from application-services/streams to application-services/streams/kafkas
    component: RedirectToStreamsKafkas,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/streams',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: RedirectToStreamsKafkas,
    // Handle the redirect for the old url application-services/openshift-streams to application-services/streams/kafkas
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/openshift-streams',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: KasPage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/streams/kafkas',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: SrsPage,
    exact: true,
    label: 'Service Registry',
    path: '/sr',
    title: 'Service Registry',
    federatedComponent: 'artifacts',
  },
  {
    component: SrsPage,
    exact: true,
    label: 'Service Registry',
    path: '/sr/t/:tenantId/artifacts',
    title: 'Service Registry',
    federatedComponent: 'artifacts',
  },
  {
    component: SrsPage,
    exact: true,
    label: 'Service Registry',
    path: '/sr/t/:tenantId/rules',
    title: 'Service Registry',
    federatedComponent: 'rules',
  },
  {
    component: SrsPage,
    exact: true,
    label: 'Service Registry',
    path: '/sr/t/:tenantId/artifacts/:groupId/:artifactId',
    title: 'Service Registry',
    federatedComponent: 'artifact-redirect',
  },
  {
    component: SrsPage,
    exact: true,
    label: 'Service Registry',
    path: '/sr/t/:tenantId/artifacts/:groupId/:artifactId/versions/:version',
    title: 'Service Registry',
    federatedComponent: 'artifacts-details',
  },
  {
    component: ServiceAccountsPage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/streams/service-accounts',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: OverviewPage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/overview',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: RedirectToOverview,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: APIManagementPage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/api-management',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: DataSciencePage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/data-science',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: ResourcesPage,
    exact: true,
    label: 'QuickStarts for Red Hat OpenShift Application Services',
    path: '/streams/resources',
    title: 'QuickStarts for Red Hat OpenShift Application Services',
  },
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, ...rest }: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);
  const history = useHistory();
  const getBasename = () => {
    return history.createHref({ pathname: rest.path });
  };

  function routeWithTitle(routeProps: RouteComponentProps) {
    return (
      <QuickStartDrawerFederated>
        <BasenameContext.Provider value={{ getBasename }}>
          <Component {...rest} {...routeProps} />
        </BasenameContext.Provider>
      </QuickStartDrawerFederated>
    );
  }

  return <Route render={routeWithTitle} {...rest} />;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFoundPage} />;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => (
  <LastLocationProvider>
    <Switch>
      {flattenedRoutes.map(({ path, exact, component, title, isAsync, ...rest }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
          {...rest}
        />
      ))}
      <PageNotFound title="404 Page Not Found" />
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
