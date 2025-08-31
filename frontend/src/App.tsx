import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'));
const NotesPage = lazy(() => import('./features/notes'));

// Loading component
const Loading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f2f5'
  }}>
    <div>Loading NoteFusion AI...</div>
  </div>
);

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AntdApp>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={
                  <div style={{ padding: '2rem' }}>
                    <h1>Welcome to NoteFusion AI</h1>
                    <p>Please log in to continue</p>
                    <div style={{ marginTop: '2rem' }}>
                      <a href="/login" style={{ marginRight: '1rem' }}>Login</a>
                      <a href="/signup">Sign Up</a>
                    </div>
                  </div>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/notes" element={
                  <Suspense fallback={<div>Loading notes...</div>}>
                    <NotesPage />
                  </Suspense>
                } />
                <Route path="*" element={
                  <div style={{ padding: '2rem' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="/">Return to Home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
                                <Route path={AUTH_PATH} element={<AuthLayout />}>
                                  <Route index element={<Navigate to="login" replace />} />
                                  <Route path="login" element={<LoginPage />} />
                                  <Route path="signup" element={<SignupPage />} />
                                  <Route path="verify-email" element={<VerifyEmailPage />} />
                                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                                  <Route path="reset-password" element={<ResetPasswordPage />} />
                                </Route>
                                
                                <Route path="/" element={<Navigate to="/notes" replace />} />
                                
                                {/* Notes Routes */}
                                <Route 
                                  path="/notes/*" 
                                  element={
                                    <ErrorBoundary componentName="NotesPage">
                                      <NotesPage />
                                    </ErrorBoundary>
                                  } 
                                />
                                
                                {/* Audio Demo Page */}
                                <Route 
                                  path="/audio-demo" 
                                  element={
                                    <ErrorBoundary componentName="AudioDemo">
                                      <AudioDemoPage />
                                    </ErrorBoundary>
                                  } 
                                />
                                
                                {/* Tasks Page */}
                                <Route 
                                  path="/tasks" 
                                  element={
                                    <ErrorBoundary componentName="TasksPage">
                                      <TasksPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Study Tools Page */}
                                <Route 
                                  path="/study" 
                                  element={
                                    <ErrorBoundary componentName="StudyPage">
                                      <StudyPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Flashcard Routes */}
                                <Route 
                                  path="/flashcards" 
                                  element={
                                    <ErrorBoundary componentName="FlashcardPage">
                                      <FlashcardPage />
                                    </ErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="/flashcards/note/:noteId" 
                                  element={
                                    <ErrorBoundary componentName="FlashcardPage">
                                      <FlashcardPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Protected Profile Page */}
                                <Route 
                                  path="/profile" 
                                  element={
                                    <ProtectedRoute>
                                      <ErrorBoundary componentName="ProfilePage">
                                        <ProfilePage />
                                      </ErrorBoundary>
                                    </ProtectedRoute>
                                  } 
                                />

                                {/* Audio Tools Page */}
                                <Route 
                                  path="/audio-tools" 
                                  element={
                                    <ErrorBoundary componentName="AudioPage">
                                      <AudioPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Backup Routes */}
                                <Route 
                                  path="/backups" 
                                  element={
                                    <ErrorBoundary componentName="BackupManager">
                                      <BackupManager />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* Feature Flags Page */}
                                <Route 
                                  path="/pwa-test" 
                                  element={
                                    <ErrorBoundary componentName="PwaTest">
                                      <PwaTest />
                                    </ErrorBoundary>
                                  } 
                                />
                                <Route 
                                  path="/feature-flags" 
                                  element={
                                    <ErrorBoundary componentName="FeatureFlagsPage">
                                      <FeatureFlagsPage />
                                    </ErrorBoundary>
                                  } 
                                />

                                {/* 404 Route */}
                                <Route 
                                  path="*" 
                                  element={
                                    <div className={styles['notFoundContainer']}>
                                      <h1>404 - Page Not Found</h1>
                                      <p>The page you're looking for doesn't exist.</p>
                                    </div>
                                  } 
                                />
                              </Routes>
                            </main>
                          </FolderProvider>
                        </FeatureFlagProvider>
                      </AIOrganizationProvider>
                    </SearchProvider>
                  </AdminProvider>
                </RbacProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
=======
                        <FolderProvider>
                        <Routes>
                        <Route path={AUTH_PATH} element={<AuthLayout />}>
                          <Route index element={<Navigate to="login" replace />} />
                          <Route path="login" element={<LoginPage />} />
                          <Route path="signup" element={<SignupPage />} />
                          <Route path="verify-email" element={<VerifyEmailPage />} />
                          <Route path="forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="reset-password" element={<ResetPasswordPage />} />
                        </Route>
                        <Route path="/" element={<Navigate to="/notes" replace />} />
                        
                        {/* Notes Routes */}
                        <Route 
                          path="/notes/*" 
                          element={
                            <ErrorBoundary componentName="NotesPage">
                              <NotesPage />
                            </ErrorBoundary>
                          } 
                        />
                        
                        {/* Backup Routes */}
                        <Route 
                          path="/backups" 
                          element={
                            <ErrorBoundary componentName="BackupManager">
                              <BackupManager />
                            </ErrorBoundary>
                          } 
                        />

                        {/* Dev-only: ErrorBoundary test page */}
                        {process.env.NODE_ENV === 'development' && (
                          <Route path="/__test/error-boundary" element={
                            <ErrorBoundary>
                              <div>Error boundary test page is no longer available. Use the ErrorBoundary component directly in your components.</div>
                            </ErrorBoundary>
                          } />
                        )}
                        
                        {/* Feature Flags Page */}
                        <Route 
                          path="/feature-flags" 
                          element={
                            <ErrorBoundary componentName="FeatureFlagsPage">
                              <FeatureFlagsPage />
                            </ErrorBoundary>
                          } 
                        />

                        {/* 404 Route */}
                        <Route path="*" element={
                          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
                            <h1>404 - Page Not Found</h1>
                            <p>The page you are looking for doesn't exist or has been moved.</p>
                            <div style={{ marginTop: '20px' }}>
                              <InstallButton />
                            </div>
                          </div>
                        } />
                      </Routes>
                      </FolderProvider>
                    </AIOrganizationProvider>
                  </SearchProvider>
                </AdminProvider>
              </RbacProvider>
                </AuthProvider>
              </FeatureFlagProvider>
            </BrowserRouter>
            <Toaster position="top-right" />
          </AntdApp>
        </Suspense>
      </ConfigProvider>
    </ErrorBoundary>
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
  );
};

export default App;
