import { Component, ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export type RemoteErrorBoundaryProps = {
  remoteName: string;
  entryUrl?: string;
  children: ReactNode;
  onRetry?: () => void;
};

type RemoteErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): RemoteErrorBoundaryState {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`${this.props.remoteName}`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>{this.props.remoteName} module is unavailable</AlertTitle>
          <Stack spacing={1}>
            <Box>{this.state.message || 'The shell could not reach the remote entry.'}</Box>
            {this.props.entryUrl && (
              <Link
                href={this.props.entryUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open remote entry ({this.props.entryUrl})
              </Link>
            )}
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}
