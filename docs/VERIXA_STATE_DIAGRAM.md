# Verixa - System State Diagram (UML State Machine)

This document contains the complete **UML State Machine Diagram** for **Verixa (AI Property Decision Platform)**.

---

## 1. Mermaid.js Code (Recommended)

```mermaid
stateDiagram-v2
    [*] --> UnauthenticatedGuest: Open Application (http://localhost:5173)

    state UnauthenticatedGuest {
        [*] --> LandingPage
        LandingPage --> BrowsingProperties: Click 'Explore Properties'
        LandingPage --> BrowsingBuilders: Click 'Verified Developers'
        LandingPage --> BrowsingLocalities: Click 'Locality Intelligence'
        LandingPage --> AuthenticationForm: Click 'Login' or 'Register'
    }

    state AuthenticationForm {
        [*] --> InputCredentials
        InputCredentials --> ValidatingJWT: Submit Form
        ValidatingJWT --> InputCredentials: Auth Failed (Toast Alert)
        ValidatingJWT --> AuthenticatedUser: Credentials Verified (JWT Tokens Issued)
    }

    state AuthenticatedUser {
        [*] --> UserDashboard

        state PropertyExploration {
            [*] --> PropertyListings: GET /api/properties/
            PropertyListings --> FilteredResults: Apply Filters (City, Locality, Price, BHK)
            FilteredResults --> PropertyDetailView: Select Property (/properties/:id)

            state PropertyDetailView {
                [*] --> LoadingMetadata
                LoadingMetadata --> QueryingOSM: Fetch OpenStreetMap Nearby Places
                QueryingOSM --> CalculatingAIScores: Audit RERA & Compute Investment Score
                CalculatingAIScores --> ActiveDetailScreen: Render Map & Decision Metrics
            }
        }

        state DeveloperExploration {
            [*] --> DevelopersListings: GET /api/builders/
            DevelopersListings --> DeveloperProfileView: Select Developer (/builder/:id)

            state DeveloperProfileView {
                [*] --> FetchingBuilderProfile: GET /api/builders/:id/
                FetchingBuilderProfile --> FetchingBuilderProjects: GET /api/builders/projects/?builder=:id
                FetchingBuilderProjects --> ActiveBuilderScreen: Render Hero, Stats & Project Cards
            }
        }

        state ComparisonAndInquiry {
            ActiveDetailScreen --> AddedToCompareTray: Click 'Compare'
            ActiveBuilderScreen --> AddedToCompareTray: Click 'Compare'
            AddedToCompareTray --> ComparisonMatrixScreen: View Matrix (/comparison)
            ActiveDetailScreen --> SubmittingInquiry: Click 'Contact Builder'
            SubmittingInquiry --> InquiryDispatched: POST /api/inquiries/ (Toast Alert)
        }

        UserDashboard --> LoggedOut: Click 'Logout'
    }

    LoggedOut --> UnauthenticatedGuest: Clear Tokens (Toast Alert)
    AuthenticatedUser --> [*]: Close Session
```

---

## 2. PlantUML Code (Alternative Format)

```plantuml
@startuml Verixa_State_Diagram
title Verixa - AI Property Decision Platform (State Machine Diagram)

[*] --> GuestSession : Open Web App

state GuestSession {
  [*] --> LandingScreen
  LandingScreen --> PublicSearch : Browse Properties
  LandingScreen --> DeveloperListings : Browse Developers
  LandingScreen --> AuthScreen : Click Login/Register
}

state AuthScreen {
  [*] --> CredentialsForm
  CredentialsForm --> TokenValidation : Submit Form
  TokenValidation --> CredentialsForm : Error Toast
  TokenValidation --> UserAuthenticated : JWT Issued
}

state UserAuthenticated {
  [*] --> ActiveDashboard
  
  state PropertyFlow {
    [*] --> PropertyGrid
    PropertyGrid --> PropertyDetails : Select Property ID
    PropertyDetails --> OSMSync : Query Overpass API (Nearby Places)
    OSMSync --> DecisionEngine : Compute AI Trust & Growth Score
    DecisionEngine --> ReadyPropertyView
  }

  state BuilderFlow {
    [*] --> DeveloperGrid
    DeveloperGrid --> DeveloperProfile : Select Developer ID
    DeveloperProfile --> ProjectSync : Query BuilderProject Table
    ProjectSync --> ReadyDeveloperView
  }

  state ActionFlow {
    ReadyPropertyView --> ComparisonTray : Add to Compare
    ReadyDeveloperView --> ComparisonTray : Add to Compare
    ComparisonTray --> MatrixView : Open /comparison
    ReadyPropertyView --> InquirySubmitted : Dispatch Contact Request
  }

  ActiveDashboard --> SessionEnded : Click Logout
}

SessionEnded --> GuestSession : Clear Tokens
UserAuthenticated --> [*]

@enduml
```
