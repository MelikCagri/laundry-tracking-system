# Rol ve Metod Sınıf Diyagramı (Class Diagram)

Aşağıdaki şema, sistemdeki rollerin hiyerarşisini, sahip oldukları metodları ve Makine (Machine) nesnesi ile olan ilişkilerini göstermektedir. Ayrıca sizin belirlediğiniz iş kuralları (Business Logic) da sisteme dahil edilmiştir.

```mermaid
classDiagram
    %% Temel Kullanıcı Sınıfı
    class User {
        +String id
        +String phone
        +Enum role
        +getMachines()
        +identifyUser(phone)
    }

    %% Öğrenci Rolü (User'dan türer)
    class Student {
        <<Role: USER>>
        +startMachine(machineId, duration, note)
        +extendMachineTime(machineId, extraMinutes)
        +finishMachine(machineId)
        +joinQueue(machineId)
        +leaveQueue(machineId)
        +reportIssue(machineId, issueType)
    }

    %% Admin Rolü (User'dan türer)
    class Admin {
        <<Role: ADMIN>>
        +createMachine(data)
        +updateMachine(machineId, data)
        +deleteMachine(machineId)
        +forceResetMachine(machineId)
        +setMachineStatus(machineId, status)
        +getAllLogs()
    }

    %% Makine Sınıfı
    class Machine {
        +String id
        +Enum status
        +Int fullReportCount
        +Int brokenReportCount
    }

    %% Otomatik İş Kuralları (Business Logic)
    class SystemLogic {
        <<Business Rules>>
        +enforceSingleQueueEntry(userId)
        +enforceSingleReport(userId, machineId)
        +checkAutoStatusUpdate(machineId)
    }

    %% İlişkiler
    User <|-- Student : extends
    User <|-- Admin : extends
    
    Student --> Machine : interacts
    Admin --> Machine : manages
    
    Machine --> SystemLogic : triggers
    Student ..> SystemLogic : constrained by
```

### Diyagramın Özeti:
1. **Kalıtım (Inheritance):** `Student` ve `Admin` sınıfları temel `User` sınıfından türer (extends). Yani her ikisi de makineleri görüntüleyebilir.
2. **Kısıtlamalar:** `Student`, `SystemLogic` tarafından kısıtlanır (örneğin birden fazla sıraya giremez).
3. **Otomasyon:** `Machine` üzerinde yapılan raporlamalar `SystemLogic`'i tetikler ve rapor sayısına göre makinenin durumunu otomatik günceller.
